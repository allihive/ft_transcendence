import type { JSX } from "react";
import type { TwoFactorModal as TwoFactorModalProps} from "../forms/user/update/types";
import { useTranslation } from "react-i18next";

export default function TwoFactorModal({ 
	isOpen,
	onClose,
}: TwoFactorModalProps): JSX.Element | null {
	const { t } = useTranslation();
	if (!isOpen) return null;

	const handleOverlayClick = () => {
		onClose();
	  };
	
	  const stopPropagation = (e: React.MouseEvent) => {
		e.stopPropagation();
	  };
	

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-xs"
			role="dialog"
			aria-modal="true"
			onClick={handleOverlayClick}
		>
			<div className="bg-darkBlue dark:background rounded-xl shadow-xl p-6 w-full max-w-md relative"
				onClick={stopPropagation}>
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
					{t('2factorAuth')}
				</h2>
				<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
					{t('2factorScan')}
				</p>
				<div className="w-full h-40 bg-background dark:bg-darkMode mb-4 flex items-center justify-center">
					{/* Replace with actual QR code */}
					<span className="text-gray-500 dark:text-gray-300">[QR CODE]</span>
				</div>
				<button
					onClick={onClose}
					className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
				>
					{t('close')}
				</button>
				<button
					onClick={onClose}
					className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-white"
				>
					✕
				</button>
			</div>
		</div>
	);
}
