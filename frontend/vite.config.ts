import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	server: {
		open: true,
		proxy: {
			"/api/realtime/ws": {
				target: "http://localhost:3000/",
				changeOrigin: true,
				secure: false,
				ws: true,
				configure: (proxy, options) => {
					// 쿠키 전달을 명시적으로 활성화
					proxy.on('proxyReq', (proxyReq, req, res) => {
						console.log('🔍 WebSocket proxy request - cookies:', req.headers.cookie);
					});
				}
			},
			"/api": {
				target: "http://localhost:3000/",
				changeOrigin: true,
				secure: false,
				rewrite: (path: string) => path.replace(/^\/api/, ""),
				ws: true 
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
