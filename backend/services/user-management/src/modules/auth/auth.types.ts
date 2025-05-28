import { RegisterOptions } from "fastify";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";

export type AuthControllerOptions = RegisterOptions & {
	authService: AuthService
};

export type AuthModuleOptions = {
	userService: UserService
}