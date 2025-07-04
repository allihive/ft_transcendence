import { useState, useEffect, type JSX } from "react"
import { NavLink } from "react-router"

export function PlayPage(): JSX.Element {
	const [isPlaying, setIsPlaying] = useState(false);
	useEffect(() => {
		fetch(`http://localhost:3000/api/matchmaking/join`)
		.then((res) => res.json())
		.catch((err) => console.error("Failed to create match", err))
	})

	return (
		<>
		<div className="flex items-center justify-center w-full px-8 my-8">
				<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
				<span className="px-4 text-black dark:text-background font-title">Player Modes</span>
				<div className="flex-grow max-w-2xl mx-8 border-t border-black dark:border-white"></div>
		</div>
		<div className="flex flex-col justify-center items-center mt-8 font-title ">
			<NavLink to="/twoPlayers" className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-8">2 Players</NavLink>
			<button className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-8"
				>Remote Online Player</button>
			<button className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-8"
				>Join Tournament</button>
		</div>
		</>
	)
}
