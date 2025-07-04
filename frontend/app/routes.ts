import { type RouteConfig, index, prefix, layout, route } from "@react-router/dev/routes";

export default [
	route(".well-known/*", "./wellKnownStub.tsx"),

	layout("./routes/RootLayout.tsx", [
		index("routes/Home.tsx"),
		route("play", "./routes/play/Play.tsx"),
		route("twoPlayers", "./routes/play/TwoPlayers.tsx"),
		route("login", "./routes/login.tsx"),
		route("register", "./routes/register.tsx"),

		layout("./routes/AuthGuard.tsx", [
			route("chat", "./routes/Chat.tsx"),
			route("tournament", "./routes/Tournament.tsx"),
			...prefix("users", [
				layout("./routes/users/UsersLayout.tsx", [
					route("profile", "./routes/users/UserAccount.tsx"),
					route("friends", "./routes/users/UserFriends.tsx"),
					route("stats", "./routes/users/UserStats.tsx"),
			]),
		]),
		]),
	]),
] satisfies RouteConfig;

