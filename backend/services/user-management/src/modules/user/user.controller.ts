import { FastifyPluginAsync } from "fastify";

export const userController: FastifyPluginAsync = async (app) => {
	// Get a list of all users
	app.get("/", async (request, reply) => {
		// user.service - > findAll()
	});

	// Get details of a specific user by ID
	app.get("/:id", async (request, reply) => {
		// user.service - > find(id)
	});

	// Create a new user (if separate from registration)
	app.post("/", async (request, reply) => {
		// user.service - > create()
	});

	// Update user profile (name, email, etc.)
	app.put("/:id", async (request, reply) => {
		// user.service - > update()
	});

	// Delete a user account
	app.delete("/:id", async (request, reply) => {
		// user.service - > delete()
	});
}