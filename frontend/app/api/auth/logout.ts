import { fetchJson } from "../client";
import { websocketService } from "../../services/websocket.service";

export const logout = async (): Promise<void> => {
	// Force disconnect WebSocket first to ensure user goes offline
	console.log('🔌 Force disconnecting WebSocket on logout');
	websocketService.disconnect();
	
	// Then logout from server
	await fetchJson<void>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, { method: "POST" });
};
