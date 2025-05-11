import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "../../../mikro-orm.config";
import { FastifyPluginAsync } from "fastify";

export const databaseModule: FastifyPluginAsync = async (app) => {
	const mikroOrm = await MikroORM.init(mikroConfig);
	app.decorate("orm", mikroOrm);
};