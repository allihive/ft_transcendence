import { CookieSerializeOptions } from "@fastify/cookie";

export const cookieConfig: CookieSerializeOptions = {
	path: "/",		// Cookie is available for the entire app.
	signed: true,	// Signed for integrity and to prevent tampering.
	httpOnly: true,	// Prevent client-side access for security
	secure: process.env.NODE_ENV === "production",	// Enable https protocol for security in production mode.
	sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",	// Prevent CSRF attacks in production
	maxAge: 60 * 60 * 24 * 7	// 7 days expiration
};
