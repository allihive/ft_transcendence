import { useEffect, useState } from "react";

//not working currently

export function ThemeToggle() {
	const [theme, setTheme] = useState("light");
	
	useEffect(() => {
		const root = window.document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, [theme]);

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<button
			onClick={toggleTheme}
			className="border border-black dark:border-background px-4 py-2 rounded-lg text-sm">
				{theme === "dark" ? "light" : "dark"}
		</button>
	)
}