import { type RouteConfig, index, prefix, layout, route } from "@react-router/dev/routes";

export default [
	layout("./routes/RootLayout.tsx", [
		index("routes/Home.tsx"),
		route("play", "./routes/Play.tsx"),
		route("tournament", "./routes/Tournament.tsx"),
		
		...prefix("users", [
			layout("./routes/users/UsersLayout.tsx", [
				index("./routes/users/NewUser.tsx"),
				route("profile", "./routes/users/UserAccount.tsx"),
				route("friends", "./routes/users/UserFriends.tsx"),
				route("stats", "./routes/users/UserStats.tsx"),
		]),
	]),
]),
] satisfies RouteConfig;

