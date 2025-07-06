import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	server: {
		open: true,
		proxy: {
			"/api": {
				target: "http://localhost:3000/",
				changeOrigin: true,
				secure: false,
				rewrite: (path: string) => path.replace(/^\/api/, "")
			},
			"/files": {
				target: "http://localhost:3000/",
				changeOrigin: true,
				secure: false,
				rewrite: (path: string) => path.replace(/^\/files/, "")
			}
		},
	},
});
