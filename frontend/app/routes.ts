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
		route("chat", "./pages/chat/ChatPage.tsx"),

		...prefix("users", [
			layout("./routes/users/UsersLayout.tsx", [
				route("profile", "./routes/users/profile.tsx"),
				route("friends", "./routes/users/UserFriends.tsx"),
				route("stats", "./routes/users/UserStats.tsx"),
			]),
		])
	])
] satisfies RouteConfig;

