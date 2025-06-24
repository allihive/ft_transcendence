/// <reference types="vite/client" />

interface ViteTypeOptions {
	strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
	readonly VITE_APP_TITLE: string;
	readonly VITE_API_BASE_URL;
	readonly VITE_GOOGLE_CLIENT_ID;
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}