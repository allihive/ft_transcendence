import { CookieSerializeOptions } from "@fastify/cookie";

export const cookieConfig: CookieSerializeOptions = {
	path: "/",
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",	// Enable https in production mode.
	sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",	// Prevent CSRF attacks in production
	maxAge: 60 * 60 * 24 * 7	// 7 days expiration
};
