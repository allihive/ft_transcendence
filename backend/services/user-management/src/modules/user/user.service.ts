import { EntityData, EntityManager, RequiredEntityData } from "@mikro-orm/core";
import { User } from "./entities/user.entity";
import { CreateUserDto, FindAllUsersDto, FindUserDto, UpdateUserDto, UserResponseDto } from "./user.dto";
import { UserRepository } from "./user.repository";
import { CryptoService } from "../../shared/utils/CryptoService";

export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly cryptoService: CryptoService
	) { }

	async findUser(em: EntityManager, findUserDto: FindUserDto): Promise<UserResponseDto> {
		const { id } = findUserDto;
		const user = await this.userRepository.findUser(em, id);

		const userResponse: UserResponseDto = {
			id: user.id,
			email: user.email,
			userName: user.userName,
			name: user.name,
			avatarUrl: user.avatarUrl,
			lastLogin: user.lastLogin?.toString()
		};

		return userResponse;
	}

	async findAllUsers(em: EntityManager, findAllUsersDto: FindAllUsersDto): Promise<[UserResponseDto[], number]> {
		const { page, limit } = findAllUsersDto;
		const [users, total] = await this.userRepository.findAllUsers(em, page, limit);

		return [
			users.map((user) => ({
				id: user.id,
				email: user.email,
				userName: user.userName,
				name: user.name,
				avatarUrl: user.avatarUrl,
				lastLogin: user.lastLogin?.toString()
			} satisfies UserResponseDto)),
			total
		];
	}

	async createUser(em: EntityManager, createUserDto: CreateUserDto): Promise<UserResponseDto> {
		const userData: RequiredEntityData<User> = {
			email: createUserDto.email,
			userName: createUserDto.userName,
			passwordHash: this.cryptoService.hash(createUserDto.password),
		};

		const user = await this.userRepository.createUser(em, userData);

		const userResponse: UserResponseDto = {
			id: user.id,
			email: user.email,
			userName: user.userName,
			name: user.name,
			avatarUrl: user.avatarUrl,
			lastLogin: user.lastLogin?.toString()
		};

		return userResponse;
	}

	async updateUser(em: EntityManager, id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
		const userData = updateUserDto satisfies EntityData<User>;

		const user = await this.userRepository.updateUser(em, id, userData);

		const userResponse: UserResponseDto = {
			id: user.id,
			email: user.email,
			userName: user.userName,
			name: user.name,
			avatarUrl: user.avatarUrl,
			lastLogin: user.lastLogin?.toString()
		};

		return userResponse;
	}

	async deleteUser(em: EntityManager, id: string): Promise<void> {
		return this.userRepository.deleteUser(em, id);
	}
}
