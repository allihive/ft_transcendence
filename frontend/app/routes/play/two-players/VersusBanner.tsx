import { useState, type JSX } from "react";
import { toast } from "react-hot-toast";
import { Popover } from "react-tiny-popover";
import type { SuccessHandler } from "~/components/forms/user/login/types";
import { UserVerificationForm } from "~/components/forms/user/login/UserVerificationForm";
import { usePlayers } from "~/stores/usePlayers";

export function VersusBanner(): JSX.Element {
	const players = usePlayers((state) => state.players);
	const setPlayers = usePlayers((state) => state.setPlayers);
	const [popoverId, setPopoverId] = useState<string | null>(null);

	const successHandler: SuccessHandler = async (user) => {
		if (!user) {
			toast.error("User not found");
			setPopoverId(null);
			return;
		}

		setPlayers((currentPlayers) => {
			const i = currentPlayers.findIndex(({ id }) => id === popoverId);

			if (i === -1) {
				return currentPlayers;
			}

			const newPlayers = [...currentPlayers];

			newPlayers[i] = {
				id: user.id,
				username: user.username,
				avatarUrl: new URL(user.avatarUrl, import.meta.env.VITE_API_BASE_URL).toString()
			};

			return newPlayers;
		});
		setPopoverId(null);
	};

	return (
		<div className="flex flex-row justify-center items-center gap-x-10">
			<Popover
				isOpen={popoverId === players[0].id}
				positions={"bottom"}
				content={
					<div className="p-2 bg-lightOrange rounded-lg">
						<UserVerificationForm onSuccess={successHandler} onFailure={(error) => toast.error(error.message)} />
					</div>
				}
				onClickOutside={() => setPopoverId(null)}
			>
				<div onClick={() => setPopoverId(players[0].id)} className="flex flex-col items-center hover:cursor-pointer">
					<img src={players[0].avatarUrl} alt="Player 1" className="block w-[100px] h-auto rounded-full" />
					<span>{players[0].username}</span>
				</div>
			</Popover>

			<img src="/icons/vs.svg" alt="VS icon" className="w-[200px] h-auto" />

			<Popover
				isOpen={popoverId === players[1].id}
				positions={"bottom"}
				content={
					<div className="p-2 bg-lightOrange rounded-lg">
						<UserVerificationForm onSuccess={successHandler} onFailure={(error) => toast.error(error.message)} />
					</div>
				}
				onClickOutside={() => setPopoverId(null)}
			>
				<div onClick={() => setPopoverId(players[1].id)} className="flex flex-col items-center hover:cursor-pointer">
					<img src={players[1].avatarUrl} alt="Player 2" className="block w-[100px] h-auto rounded-full" />
					<span>{players[1].username}</span>
				</div>
			</Popover>
		</div>
	);
}
