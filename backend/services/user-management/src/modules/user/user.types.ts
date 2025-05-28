import { CryptoService } from "../../shared/utils/CryptoService";
import { UserService } from "./user.service";
import { RegisterOptions } from "fastify";

export type UserControllerOptions = RegisterOptions & {
	userService: UserService
};

export type UserModuleOptions = {
	cryptoService: CryptoService
};