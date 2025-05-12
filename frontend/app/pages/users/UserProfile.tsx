import { type JSX } from "react"

export function UsersProfile(): JSX.Element {
	// const handleSubmitClick = () => addToDataBase();

	return (
		<div className="flex flex-col justify-left">
			<div className="font-title text-md dark:text-background">First Name</div>
			<input
				type="text"
				placeholder="show current first name"
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
			<div className="font-title text-md mt-8 dark:text-background">Last Name</div>
			<input
				type="text"
				placeholder="show current last name"
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
			<div className="font-title text-md mt-8 dark:text-background">Username</div>
			<input
				type="text"
				placeholder="show current username"
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
			<div className="font-title text-md mt-8 dark:text-background">Email</div>
			<input
				type="text"
				placeholder="show current email name"
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
			<div className="font-title text-md mt-8 dark:text-background">Password</div>
			<input
				type="password"
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
			<button className="border-black border-2 p-2 max-w-sm bg-brown mt-8 rounded-lg text-md font-title">Save Changes</button>
		</div>

	)
}
