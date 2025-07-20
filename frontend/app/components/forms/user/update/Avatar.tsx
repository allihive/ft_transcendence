import { useState, type ChangeEventHandler, type InputHTMLAttributes, type JSX } from "react";
import type { FieldError } from "react-hook-form";
import { useTranslation } from "react-i18next";

type AvatarProps = {
	url: string;
	avatarInputProps: InputHTMLAttributes<HTMLInputElement>;
	error?: FieldError
};

export function Avatar({ url, avatarInputProps, error }: AvatarProps): JSX.Element {
	const { t } = useTranslation();
	const [imageSource, setImageSource] = useState<string>(url);

	const changeHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
		const file = event.target.files?.[0];

		if (file) {
			const newImageSource = URL.createObjectURL(file);
			setImageSource(newImageSource);
		}
		
		avatarInputProps.onChange?.(event);
	};

	return (
		<div className="flex flex-col items-center">
			<img src={imageSource} alt="Avatar" className="block w-[100px] h-auto rounded-full m-auto" />

			<label htmlFor="avatar" className="hover:cursor-pointer font-body">{t("changeAvatar")}</label>
			<input
				{...avatarInputProps}
				id="avatar"
				type="file"
				accept=".jpeg, .jpg, .png, image/jpeg, image/png"
				className="hidden"
				onChange={changeHandler}
			/>

			{error && <p className="text-xs font-body text-red-500">{error.message}</p>}
		</div>
	);
}