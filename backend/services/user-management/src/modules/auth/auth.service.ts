import { EntityManager } from "@mikro-orm/core";
import { LoginDto, RegisterDto } from "./auth.dto";
import { UserService } from "../user/user.service";
import { CreateUserDto, UserResponseDto } from "../user/user.dto";

export class AuthService {
	constructor(private readonly userService: UserService) {}

	async login(em: EntityManager, loginDto: LoginDto) {

	}

	async logout(em: EntityManager, id: string) {

	}

	async register(em: EntityManager, registerDto: RegisterDto): Promise<UserResponseDto> {
		const createUserDto: CreateUserDto = {
			email: registerDto.email,
			userName: registerDto.userName,
			password: registerDto.password,
			confirmPassword: registerDto.confirmPassword
		};

		return this.userService.createUser(em, createUserDto);
	}
}

