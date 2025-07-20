import { EntityData, EntityManager, RequiredEntityData, UniqueConstraintViolationException } from "@mikro-orm/core";
import { BadRequestException } from "../../common/exceptions/BadRequestException";
import { ConflictException } from "../../common/exceptions/ConflictException";
import { NotFoundException } from "../../common/exceptions/NotFoundException";
import { UnauthorizedException } from "../../common/exceptions/UnauthorizedException";
import { CryptoService } from "../../common/utils/CryptoService";
import { AuthMethod, User } from "./entities/user.entity";
import { CreateUserDto, FindPaginatedUsersQueryDto, UpdateUserDto } from "./user.dto";
import { UserRepository } from "./user.repository";

export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly cryptoService: CryptoService
	) { }

	async findUser(em: EntityManager, where: Partial<User>): Promise<User | null> {
		return this.userRepository.findUser(em, where);
	}

	async findUserByCredentials(em: EntityManager, email: string, password: string): Promise<User | null> {
		const user = await this.userRepository.findUser(em, { email });

		if (!user) {
			return null;
		}

		if (user.authMethod !== AuthMethod.PASSWORD) {
			throw new BadRequestException("This account is not using password-based authentication");
		}

		if (!user.passwordHash || !this.cryptoService.compare(password, user.passwordHash)) {
			return null;
		}

		return user;
	}

	async findUsers(em: EntityManager, findPaginatedUsersQueryDto: FindPaginatedUsersQueryDto): Promise<[User[], number]> {
		const { page, limit } = findPaginatedUsersQueryDto;
		return this.userRepository.findUsers(em, page, limit);
	}

	async createUser(em: EntityManager, createUserDto: CreateUserDto): Promise<User> {
		const userData: RequiredEntityData<User> = {
			email: createUserDto.email,
			name: createUserDto.name,
			username: createUserDto.username,
			passwordHash: createUserDto.password ? this.cryptoService.hash(createUserDto.password) : null,
			authMethod: createUserDto.authMethod,
			avatarUrl: createUserDto.avatarUrl
		};

		return this.userRepository.createUser(em, userData);
	}

	async updateUser(em: EntityManager, user: User, updateUserDto: UpdateUserDto): Promise<User> {
		const { email, name, username, avatarUrl, emailVerified, totpSecret, isTwoFactorEnabled, newPassword } = updateUserDto;

		if (email && user.authMethod !== AuthMethod.PASSWORD)
			throw new BadRequestException(`'${email}' couldn't be updated because this account isn't using password-based authentication`);
		if (isTwoFactorEnabled && user.isTwoFactorEnabled)
			throw new BadRequestException(`User ${user.username} has already enabled 2FA`);
		if (newPassword && user.authMethod !== AuthMethod.PASSWORD)
			throw new BadRequestException(`'${newPassword}' couldn't be updated because this account isn't using password-based authentication`);

		const userData: EntityData<User> = {};

		if (email) userData.email = email;
		if (name) userData.name = name;
		if (username) userData.username = username;
		if (avatarUrl) userData.avatarUrl = avatarUrl;
		if (emailVerified !== undefined) userData.emailVerified = emailVerified;
		if (totpSecret) userData.totpSecret = totpSecret;
		if (isTwoFactorEnabled !== undefined) userData.isTwoFactorEnabled = isTwoFactorEnabled;
		if (newPassword) userData.passwordHash = this.cryptoService.hash(newPassword);

		return this.userRepository.updateUser(em, user, userData);
	}

	async updateUserById(em: EntityManager, id: string, updateUserDto: UpdateUserDto): Promise<User> {
		const user = await this.userRepository.findUser(em, { id });

		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		return this.updateUser(em, user, updateUserDto);
	}

	async deleteUser(em: EntityManager, id: string): Promise<void> {
		return this.userRepository.deleteUser(em, id);
	}
}
