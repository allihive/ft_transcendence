import { createApp } from "./app";

const start = async (): Promise<void> => {
	try {
		const app = await createApp({
			logger: true,
			pluginTimeout: 10000
		});

		await app.listen({ port: 3000 });
		console.log(app.printRoutes());
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

start();