import { createApp } from "./app";

const start = async (): Promise<void> => {
	try {
		const app = await createApp({
			logger: true,
			pluginTimeout: 10000
		});

		const port = process.env.PORT ? Number(process.env.PORT) : 3000;
		await app.listen({ port });
		console.log(app.printRoutes());
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

start();