import { EntityManager } from "@mikro-orm/core";
import { OAuth2Client } from "google-auth-library";
import { BadRequestException } from "../../common/exceptions/BadRequestException";
import { AuthMethod, User } from "../user/entities/user.entity";
import { CreateUserDto } from "../user/user.dto";
import { UserService } from "../user/user.service";
import { LoginDto } from "./auth.dto";
import { AuthRepository } from "./auth.repository";

const getPayload = async (authClient: OAuth2Client, googleIdToken: string): Promise<{
	providerUserId: string,
	email: string,
	name: string,
	avatarUrl: string | undefined
}> => {
	const ticket = await authClient.verifyIdToken({
		idToken: googleIdToken,
		audience: process.env.GOOGLE_CLIENT_ID!
	});

	const payload = ticket.getPayload();

	if (!payload || !payload.sub || !payload.email) {
		throw new BadRequestException("Invalid Google ID token: missing 'sub' or 'email' in payload");
	}

	return {
		providerUserId: payload.sub,
		email: payload.email,
		name: payload.name || payload.given_name || payload.family_name || "Unknown",
		avatarUrl: payload.picture
	};
};

const generateUsername = (name: string): string => {
	let base = name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

	if (base.length > 26) {
		base = base.slice(0, 26);
	}

    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `${base}${randomSuffix}`;
}

export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly userService: UserService,
		private readonly authClient: OAuth2Client
	) { }

	async login(em: EntityManager, loginDto: LoginDto): Promise<User> {
		const { email, password } = loginDto;
		const user = await this.userService.findUserByCredentials(em, email, password);
		return user;
	}

	async loginWithGoogle(em: EntityManager, idToken: string): Promise<User> {
		return em.transactional(async (em) => {
			const { providerUserId, email, name, avatarUrl } = await getPayload(this.authClient, idToken);

			let userProvider = await this.authRepository.findUserProvider(em, { provider: "google", providerUserId });
			let user = await this.userService.findUser(em, { email });

			if (!user) {
				user = await this.userService.createUser(em, {
					email,
					name,
					username: generateUsername(name),
					authMethod: AuthMethod.GOOGLE,
					avatarUrl
				});
			}

			if (!userProvider) {
				userProvider = await this.authRepository.createUserProvider(em, {
					user,
					provider: "google",
					providerUserId,
					email
				});
			}

			return user;
		});
	}

	async register(em: EntityManager, createUserDto: CreateUserDto): Promise<User> {
		return this.userService.createUser(em, createUserDto);
	}
}

