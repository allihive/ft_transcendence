import { type InputHTMLAttributes, type JSX } from "react";
import type { FieldError } from "react-hook-form";

type InputProps = {
	title: string;
	props: InputHTMLAttributes<HTMLInputElement>;
	error?: FieldError
};

export function Input({ title, props, error}: InputProps): JSX.Element {
	return (
		<>
			<div className="font-title text-md dark:text-background">{title}</div>

			<input
				className="p-2 border-2 font-body border-black dark:border-background dark:text-background rounded-lg"
				{...props}
			/>

			{error && <p className="text-xs font-body text-red-500">{error.message}</p>}
		</>
	);
}