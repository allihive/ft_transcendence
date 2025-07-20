import type { JSX } from "react";
import { Popover } from "react-tiny-popover";
import { GoogleLoginButton } from "~/components/buttons/google-login/GoogleLoginButton";
import { UserLoginForm } from "~/components/forms/user/login/UserLoginForm";
import type { LoginPopoverProps } from "./types";

export function LoginPopover(props: LoginPopoverProps): JSX.Element {
	const { onLogin, onGoogleLogin, ...popoverProps } = props;

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
			{popoverProps.children}
		</Popover>
	);
}
