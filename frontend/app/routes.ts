import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("play", "./routes/play.tsx"),
	route("tournament", "./routes/tournament.tsx"),
	route("users", "./routes/users.tsx")
] satisfies RouteConfig;
