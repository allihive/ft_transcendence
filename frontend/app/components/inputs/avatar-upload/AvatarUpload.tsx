import { useState, type ChangeEventHandler, type InputHTMLAttributes, type JSX } from "react";

export function AvatarUpload(props: InputHTMLAttributes<HTMLInputElement>): JSX.Element {
	const [imageSource, setImageSource] = useState<string>();

	const changeHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
		const file = event.target.files?.[0];

		if (file) {
			setImageSource(URL.createObjectURL(file));
		}
	}

	return (
		<div>
			<img src={imageSource} alt="Upload Image" />
			<input {...props}
				type="file"
				accept=".jpeg, .jpg, .png, image/jpeg, image/png"
				placeholder="image"
				onChange={changeHandler}
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4"
			/>
		</div>
	);
}
