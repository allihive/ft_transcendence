import { Migrator } from "@mikro-orm/migrations";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { defineConfig, ReflectMetadataProvider } from "@mikro-orm/sqlite";

const metadataProvider = (process.env.NODE_ENV  && process.env.NODE_ENV !== "production")
	?	TsMorphMetadataProvider
	:	ReflectMetadataProvider;

export default defineConfig({
	dbName: "database/sqlite.db",
	entities: ["dist/**/*.entity.js"],
	entitiesTs: ["src/**/*.entity.ts"],

	migrations: {
		path: "database/migrations",
		pathTs: "database/migrations",
		glob: "!(*.d).{js,ts}",
		transactional: true,
		disableForeignKeys: true,
		allOrNothing: true,
		emit: "ts",
	},

	metadataProvider,
	extensions: [Migrator]
});
