import { useState, type JSX } from "react";
import { Popover } from "react-tiny-popover";
import { toast } from "react-hot-toast";
import { GoogleLoginButton } from "~/components/buttons/google-login/GoogleLoginButton";
import { UserLoginForm } from "~/components/forms/user/login/UserLoginForm";
import { verifyCredentials, verifyGoogle } from "~/api/auth/verify";
import type { GoogleLoginHandler } from "~/components/buttons/google-login/types";
import type { LoginHandler } from "~/components/forms/user/login/types";
import type { User } from "~/api/types";

type JoinTournamentPopoverProps = {
	isOpen: boolean;
	onClickOutside: () => void;
	onUserJoin: (user: User) => void;
	children: React.ReactNode;
};

export function JoinTournamentPopover({ 
	isOpen, 
	onClickOutside, 
	onUserJoin, 
	children 
}: JoinTournamentPopoverProps): JSX.Element {
	const [isLoading, setIsLoading] = useState(false);

	const handleUserVerification = async (verify: () => Promise<User | null>) => {
		setIsLoading(true);
		try {
			const user = await verify();

			if (!user) {
				toast.error(`User not found in database`);
			} else {
				toast.success(`Welcome ${user.username}!`);
				onUserJoin(user);
				onClickOutside(); // Close popup after successful join
			}
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	const loginHandler: LoginHandler = async (data) => {
		await handleUserVerification(() => verifyCredentials(data.email, data.password));
	};

	const googleLoginHandler: GoogleLoginHandler = async (credential) => {
		await handleUserVerification(() => verifyGoogle(credential));
	};

	return (
		<Popover
			isOpen={isOpen}
			positions={"top"}
			onClickOutside={onClickOutside}
			content={
				<div className="p-4 bg-pop border-4 border-black rounded-lg shadow-lg">
					<h3 className="text-lg font-title font-bold mb-4 text-center">
						Join Tournament
					</h3>
					<div className="space-y-4">
						<p className="text-sm text-gray-600 text-center">
							Login to join this tournament
						</p>
						
						<UserLoginForm 
							onLogin={loginHandler}
							disabled={isLoading}
						/>
						
						<div className="text-center text-sm text-gray-500">or</div>
						
						<GoogleLoginButton
							clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
							onLogin={googleLoginHandler}
							disabled={isLoading}
						/>
						
						{isLoading && (
							<div className="text-center text-sm text-gray-500">
								Verifying user...
							</div>
						)}
					</div>
				</div>
			}
		>
			{children}
		</Popover>
	);
} 