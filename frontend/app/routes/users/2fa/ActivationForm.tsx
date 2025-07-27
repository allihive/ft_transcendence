import { type FormEventHandler, type JSX } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { activateTwoFactorAuth } from "~/api/auth/activate-2fa";
import { useAuth } from "~/stores/useAuth";

export function ActivationForm(): JSX.Element {
	const { t } = useTranslation();
	const user = useAuth((state) => state.user);
	const setUser = useAuth((state) => state.setUser);

	const submitHandler: FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);

		try {
			const activatedUser = await activateTwoFactorAuth(Number(formData.get("totpCode")));

			if (!activatedUser) {
				toast.error("Invalid TOTP code");
				return;
			}

			setUser(activatedUser);
			toast.success("Two-Factor Authentication enabled");
		} catch (error) {
			toast.error((error as Error).message);
		}
	};

	return (
		<form onSubmit={submitHandler}>
			<input
				type="number"
				name="totpCode"
				min={100000}
				max={999999}
				title="Enter a 6-digit code"
				required
				className="block w-full my-4 p-2 border-2 font-body border-black dark:border-background dark:text-background rounded-lg"
			/>
			<button
				type="submit"
				disabled={user?.isTwoFactorEnabled}
				className="block border-black border-2 ml-auto p-2 bg-brown rounded-lg text-md font-title disabled:cursor-not-allowed disabled:opacity-50"
			>
				{t("activate")}
			</button>
		</form>
	);
}