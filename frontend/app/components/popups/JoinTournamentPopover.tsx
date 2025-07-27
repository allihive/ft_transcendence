import { useState, type JSX } from "react";
import { toast } from "react-hot-toast";
import { Popover } from "react-tiny-popover";
import { UserVerificationForm } from "../forms/user/login/UserVerificationForm";
import type { User } from "~/api/types";
import type { SuccessHandler } from "~/components/forms/user/login/types";

type JoinTournamentPopoverProps = {
	isOpen: boolean;
	onClickOutside: () => void;
	onUserJoin: (user: User) => void;
	children: JSX.Element;
};

export function JoinTournamentPopover({
	isOpen,
	onClickOutside,
	onUserJoin,
	children
}: JoinTournamentPopoverProps): JSX.Element {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const successHandler: SuccessHandler = (user) => {
		if (!user) {
			toast.error(`User not found in database`);
		} else {
			toast.success(`Welcome ${user.username}!`);
			onUserJoin(user);
			onClickOutside(); // Close popup after successful join
		}
	}

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

						<UserVerificationForm
							onSubmitStateChange={setIsLoading}
							onSuccess={successHandler}
							onFailure={(error) => toast.error(error.message)}
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
