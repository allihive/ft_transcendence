import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BabylonScene } from "~/game/BabylonScene";
import { VersusBanner } from "./VersusBanner";
import { usePlayers } from "~/stores/usePlayers";
import { useLocation } from "react-router";
import { ShinyButton } from "./ShinyButton";

export async function clientLoader(): Promise<void> {
	if (usePlayers.getState().players.length === 0) {
		usePlayers.setState({
			players: [
				{ id: "1", username: "Player-1", avatarUrl: "https://cdn3d.iconscout.com/3d/premium/thumb/table-tennis-player-3d-icon-download-in-png-blend-fbx-gltf-file-formats--athlete-avatar-ping-pong-game-arhlete-avatars-pack-people-icons-8263139.png" },
				{ id: "2", username: "Player-2", avatarUrl: "https://cdn3d.iconscout.com/3d/premium/thumb/table-tennis-player-3d-icon-download-in-png-blend-fbx-gltf-file-formats--athlete-avatar-ping-pong-game-arhlete-avatars-pack-people-icons-8263139.png" }
			]
		});
	}
}

export default function TwoPlayers() {
	const { t } = useTranslation();
	const location = useLocation();
	const [isReady, setReady] = useState<boolean>(false);
	const players = usePlayers((state) => state.players);

	useEffect(() => {
		return () => {
			if (!location.pathname.startsWith("/play/two-players")) {
				usePlayers.persist.clearStorage();
				usePlayers.setState({ players: [] });
			}
		};
	}, []);

	return (
		<>
			<h1 className="flex flex-col font-title justify-center items-center mt-10">2 {t("playerMode")}</h1>
			<div className="flex flex-col font-title justify-center items-center mt-10 text-background text-sm">
				{t("playInstructions")}
			</div>
			{isReady
				?	<BabylonScene player1={players[0]} player2={players[1]} />
				:	<div className="flex flex-col gap-y-8">
						<VersusBanner />
						<ShinyButton onClick={() => setReady(true)}>
							Start
						</ShinyButton>
					</div>
			}
		</>
	)
}
