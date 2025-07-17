import { useState, type JSX } from "react";
import { toast } from "react-hot-toast";
import { verifyCredentials, verifyGoogle } from "~/api/auth/verify";
import { usePlayers } from "~/stores/usePlayers";
import { PopoverPlayer } from "./PopoverPlayer";
import type { GoogleLoginHandler } from "~/components/buttons/google-login/types";
import type { LoginHandler } from "~/components/forms/user/login/types";
import type { User } from "~/api/types";

export function VersusBanner(): JSX.Element {
	const players = usePlayers((state) => state.players);
	const setPlayers = usePlayers((state) => state.setPlayers);
	const [popoverId, setPopoverId] = useState<string | null>(null);

	const updateUser = async (verify: () => Promise<User | null>) => {
		try {
			const user = await verify();

			if (!user) {
				toast.error(`User not found`);
			} else {
				setPlayers((currentPlayers) => {
					const i = currentPlayers.findIndex(({ id }) => id === popoverId);

					if (i === -1) {
						return currentPlayers;
					}

					const newPlayers = [...currentPlayers];

					newPlayers[i] = {
						id: user.id,
						username: user.username,
						avatarUrl: user.avatarUrl
					};

					return newPlayers;
				});
			}
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setPopoverId(null);
		}
	};

	const loginHandler: LoginHandler = async (data) => {
		await updateUser(() => verifyCredentials(data.email, data.password));
	};

	const googleLoginHandler: GoogleLoginHandler = async (credential) => {
		await updateUser(() => verifyGoogle(credential));
	};

	return (
		<div className="flex flex-row justify-center items-center gap-x-10">
			<PopoverPlayer
				isOpen={popoverId === players[0].id}
				player={players[0]}
				onLogin={loginHandler}
				onGoogleLogin={googleLoginHandler}
				onClick={() => setPopoverId(players[0].id)}
				onClickOutside={() => setPopoverId(null)}
			/>

			<img src="/icons/vs.svg" alt="VS icon" className="w-[200px] h-auto" />

			<PopoverPlayer
				isOpen={popoverId === players[1].id}
				player={players[1]}
				onLogin={loginHandler}
				onGoogleLogin={googleLoginHandler}
				onClick={() => setPopoverId(players[1].id)}
				onClickOutside={() => setPopoverId(null)}
			/>
		</div>
	);
}
