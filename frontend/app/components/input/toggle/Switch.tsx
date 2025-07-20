import { type JSX } from "react";
import type { SwitchProps } from "./types";

export function Switch({ label, inputProps }: SwitchProps): JSX.Element {
	return (
		<div className="flex flex-row items-center">
			<div>
				<input type="checkbox" id="toggle" className="peer sr-only opacity-0" {...inputProps} />
				<label
					htmlFor="toggle"
					className="
						relative flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-400 px-0.5
						outline-gray-400 transition-colors
						before:h-5 before:w-5 before:rounded-full before:bg-white
						before:shadow before:transition-transform before:duration-300
						peer-checked:bg-green-500
						peer-checked:before:translate-x-full
						peer-focus-visible:outline
						peer-focus-visible:outline-offset-2
						peer-focus-visible:outline-gray-400
						peer-checked:peer-focus-visible:outline-green-500
					"
				>
					<span className="sr-only">Enable</span>
				</label>
			</div>
			{ label ? <span className="ms-3 text-sm font-medium font-title text-gray-900 dark:text-background">{label}</span> : null }
		</div>
	);
}
