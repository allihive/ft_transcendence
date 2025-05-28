import { EntityData, EntityManager, RequiredEntityData } from "@mikro-orm/core";
import { User } from "./entities/user.entity";

export class UserRepository {
	async createUser(em: EntityManager, userData: RequiredEntityData<User>): Promise<User> {
		const user = em.create(User, userData);
		await em.flush();
		return user;
	}

	async findUser(em: EntityManager, id: string): Promise<User> {
		return em.findOneOrFail(User, { id });
	}

	async findAllUsers(em: EntityManager, page: number, limit: number): Promise<[User[], total: number]> {
		const offset = (page - 1) * limit;
		return em.findAndCount(User, { isActive: true }, { offset, limit });
	}

	async updateUser(em: EntityManager, id: string, userData: EntityData<User>): Promise<User> {
		const user = await em.findOneOrFail(User, { id });
		em.assign(user, userData);
		await em.flush();
		return user;
	}

	async deleteUser(em: EntityManager, id: string): Promise<void> {
		const user = await em.findOneOrFail(User, { id });
		return em.removeAndFlush(user);
	}
}
