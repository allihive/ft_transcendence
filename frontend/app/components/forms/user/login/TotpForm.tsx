import type { FormEventHandler, JSX } from "react";
import type { TotpFormProps } from "./types";

export function TotpForm({ onSubmit, submitTitle, disabled }: TotpFormProps): JSX.Element {
	const submitHandler: FormEventHandler<HTMLFormElement> = async (event) => {
		const form = event.currentTarget;

		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}

		event.preventDefault();

		const formData = new FormData(form);
		const totpCode = formData.get("totpCode");

		if (typeof totpCode !== "string") {
			throw new Error("Unexpected form data type for TOTP code");
		}

		onSubmit(totpCode, event);
	};

	return (
		<form onSubmit={submitHandler}>
			<input
				type="text"
				name="totpCode"
				inputMode="numeric"
				pattern="\d{6}"
				minLength={6}
				maxLength={6}
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
