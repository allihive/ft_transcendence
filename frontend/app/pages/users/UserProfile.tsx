import { useEffect, useState, type JSX } from "react"
import type { getUserResponseDto, UpdateUserDtoSchema } from "../../../../backend/src/modules/user/user.dto"
import { fetchCurrentUser, updateUser } from "~/services/user.service";


export interface getUserResponseDto {
	id: string;
	email: string;
	name: string;
	avatarUrl: string;
	lastLogin: string;
};

export function UsersProfile(): JSX.Element {
	const [user, setUser] = useState<getUserResponseDto | null>(null);
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	useEffect(() => {
		fetchCurrentUser()
		.then((userData) => {
			setUser(userData);
			setName(userData.name);
			// setUsername(userData.username);
			setEmail(userData.email);
		})
		.catch((err) => console.error("Failed to load user: ", err));
	}, []);

	 const handleSaveChanges = async () => {
		const updatedData: Record<string, any> = {
			name,
			email,
			username
		};
		if (!user)
			return;
		if (password) {
				if (password !== confirmPassword) {
					alert("Passwords do not match");
					return;
				}
			}
			updatedData.password = password;
			updatedData.confirmPassword = confirmPassword;
		try {
			await updateUser(user.id, {
				name,
				email,
				username,
			});
			alert("Profile updated!");
		} catch(error) {
			console.error("update failed:", error);
			alert("Failed to update profile.");
		}
	 };

	 if (!user) return <p className="text-lg">Loading...</p>;


	return (
		<div className="flex flex-col justify-left">
			<div className="font-title text-md dark:text-background">Name</div>
			<input
				type="text"
				placeholder={user.name}
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
			<div className="font-title text-md mt-8 dark:text-background">Username</div>
			<input
				type="text"
				placeholder={user.username}
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
			<div className="font-title text-md mt-8 dark:text-background">Email</div>
			<input
				type="text"
				placeholder={user.email}
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
			<div className="font-title text-md mt-8 dark:text-background">Password</div>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
			<div className="font-title text-md mt-8 dark:text-background">Confirm Password</div>
			<input
				type="text"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
			<button onClick={handleSaveChanges} className="border-black border-2 p-2 max-w-sm bg-brown mt-8 rounded-lg text-md font-title">Save Changes</button>
		</div>

	)
}
