import type { PopoverProps } from "react-tiny-popover";
import type { GoogleLoginHandler } from "~/components/buttons/google-login/types";
import type { LoginHandler } from "~/components/forms/user/login/types";

export type LoginPopoverProps = Omit<PopoverProps, "content"> & {
	onLogin: LoginHandler;
	onGoogleLogin: GoogleLoginHandler;
};
