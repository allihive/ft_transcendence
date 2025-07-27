import { type RouteConfig, index, prefix, layout, route } from "@react-router/dev/routes";

export default [
	route(".well-known/*", "./wellKnownStub.tsx"),

	layout("./routes/RootLayout.tsx", [
		index("./routes/home.tsx"),

		...prefix("play", [
			index("./routes/play/home-play.tsx"),
			route("two-players", "./routes/play/two-players/index.tsx"),
			route("tournament", "./routes/play/tournament.tsx"),
		]),

		route("login", "./routes/login.tsx"),
		route("register", "./routes/register.tsx"),
		route("tournament", "./routes/Tournament.tsx"),
		route("tournament/:tournamentId/bracket", "./routes/TournamentBracket.tsx"),
		route("tournament-game", "./routes/TournamentGame.tsx"),
		route("chat", "./pages/chat/ChatPage.tsx"),

		layout("./routes/AuthGuardLayout.tsx", [
			...prefix("users", [
				layout("./routes/users/UsersLayout.tsx", [
					route("profile", "./routes/users/profile.tsx"),
					// route("friends", "./routes/users/UserFriends.tsx"),
					route("stats", "./routes/users/UserStats.tsx"),
					route("2fa", "./routes/users/2fa/index.tsx")
				]),
			])
		])
	])
] satisfies RouteConfig;

