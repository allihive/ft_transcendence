import { type JSX, type MouseEventHandler, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type ModalProps = {
	children: ReactNode;
	onClose: (event: any) => void;
};

export function Modal({ children, onClose }: ModalProps): JSX.Element {
	const clickHandler: MouseEventHandler<any> = (event) => {
		console.log("Modal onClick()");
		onClose(event);
	};

	return createPortal(
		<div
			role="dialog"
			aria-modal="true"
			className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-xs"
			onClick={clickHandler}
		>
			<div
				className="bg-darkBlue dark:background rounded-xl shadow-xl p-6 w-full max-w-md relative"
				onClick={(e) => e.stopPropagation()}
			>
				{children}

				<button
					onClick={clickHandler}
					className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-white"
				>
					✕
				</button>
			</div>
		</div>,
		document.getElementById("portal")!
	);
}