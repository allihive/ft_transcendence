import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	layout("./routes/RootLayout.tsx", [
		index("routes/home.tsx"),
		route("play", "./routes/play.tsx"),
		route("tournament", "./routes/tournament.tsx"),
			layout("./routes/users/UsersLayout.tsx", [
				route("users", "./routes/users/users.tsx"),
				route("profile", "./routes/users/userAccount.tsx"),
				route("friends", "./routes/users/userFriends.tsx"),
				route("stats", "./routes/users/userStats.tsx")
		]),
	]),
	
] satisfies RouteConfig;
