import { existsSync, readFileSync } from "fs";
import { createApp } from "./app";
import { ServerOptions } from "https";

const start = async (): Promise<void> => {
	const keyExists = existsSync("/etc/ssl/certs/key.pem");
	const certExists = existsSync("/etc/ssl/certs/cert.pem");

	const httpsOptions: ServerOptions | null = (keyExists && certExists)
		?	{
				key: readFileSync("/etc/ssl/certs/key.pem"),
				cert: readFileSync("/etc/ssl/certs/cert.pem")
			}
		:	null;

	try {
		const app = await createApp({
			https: httpsOptions,
			logger: {
				transport: {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "SYS:standard",
						ignore: "pid,hostname"
					}
				}
			},
			pluginTimeout: 10000
		});

		const port = process.env.PORT ? Number(process.env.PORT) : 3000;
		await app.listen({ port, host: "0.0.0.0" });
		console.log(app.printRoutes());
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

start();