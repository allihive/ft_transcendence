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

	async findUserByCredentials(em: EntityManager, email: string, password: string): Promise<User> {
		const user = await this.userRepository.findUser(em, { email });

		if (!user) {
			throw new NotFoundException(`No user found with email address ${email}`);
		}

		if (user.authMethod !== AuthMethod.PASSWORD) {
			throw new BadRequestException("This account is not using password-based authentication");
		}

		if (!user.passwordHash || !this.cryptoService.compare(password, user.passwordHash)) {
			throw new UnauthorizedException("Invalid password");
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

		try {
			return this.userRepository.createUser(em, userData);
		} catch (error) {
			if (error instanceof UniqueConstraintViolationException) {
				throw new ConflictException(error.message);
			}
			throw error;
		}
	}

	async updateUser(em: EntityManager, id: string, updateUserDto: UpdateUserDto): Promise<User> {
		const userData = updateUserDto satisfies EntityData<User>;
		return this.userRepository.updateUser(em, id, userData);
	}

	async deleteUser(em: EntityManager, id: string): Promise<void> {
		return this.userRepository.deleteUser(em, id);
	}
}
