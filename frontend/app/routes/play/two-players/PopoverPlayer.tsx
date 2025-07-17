import { Popover, type PopoverProps } from "react-tiny-popover";
import { GoogleLoginButton } from "~/components/buttons/google-login/GoogleLoginButton";
import { UserLoginForm } from "~/components/forms/user/login/UserLoginForm";
import type { JSX, MouseEventHandler } from "react";
import type { Player } from "~/api/types";
import type { GoogleLoginHandler } from "~/components/buttons/google-login/types";
import type { LoginHandler } from "~/components/forms/user/login/types";

type PopoverPlayerProps = Omit<PopoverProps, "content" | "children"> & {
	player: Player;
	onClick?: MouseEventHandler<HTMLDivElement>;
	onLogin: LoginHandler;
	onGoogleLogin: GoogleLoginHandler;
};

export function PopoverPlayer(props: PopoverPlayerProps): JSX.Element {
	const { player, onClick, onLogin, onGoogleLogin, ...popoverProps } = props;

	return (
		<Popover
			positions={"bottom"}
			content={
				<div className="p-2 bg-lightOrange rounded-lg">
					<UserLoginForm onLogin={onLogin}></UserLoginForm>
					<GoogleLoginButton
						clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
						onLogin={onGoogleLogin}
					/>
				</div>
			}
			{...popoverProps}
		>
			<div onClick={onClick} className="flex flex-col items-center hover:cursor-pointer">
				<img src={player.avatarUrl} alt="Player 1" className="block w-[100px] h-auto rounded-full" />
				<span>{player.username}</span>
			</div>
		</Popover>
	);
}
