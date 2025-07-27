import type { FormEventHandler, JSX } from "react";
import type { TotpFormProps } from "./types";

export function TotpForm({ onSubmit, submitTitle, disabled }: TotpFormProps): JSX.Element {
	const submitHandler: FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault();

		const formData = new FormData(event.target as HTMLFormElement);
		const code = formData.get("totpCode");

		if (typeof code !== "string") {
			throw new Error("TOTP code missing or invalid.");
		}

		const totpCode = Number(code.trim());

		if (!Number.isInteger(totpCode) || totpCode < 100000 || totpCode > 999999) {
			throw new Error("TOTP code must be a 6-digit number.");
		}

		onSubmit(totpCode, event);
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
				disabled={disabled}
				className="block border-black border-2 ml-auto p-2 bg-brown rounded-lg text-md font-title disabled:cursor-not-allowed disabled:opacity-50"
			>
				{submitTitle}
			</button>
		</form>
	);
}
