import { EntityData, EntityManager, RequiredEntityData } from "@mikro-orm/core";
import { User } from "./entities/user.entity";
import { NotFoundException } from "../../common/exceptions/NotFoundException";

export class UserRepository {
	async createUser(em: EntityManager, userData: RequiredEntityData<User>): Promise<User> {
		const user = em.create(User, userData);
		await em.persistAndFlush(user);
		return user;
	}

	async findUser(em: EntityManager, where: Partial<User>): Promise<User | null> {
		return em.findOne(User, where);
	}

	async findUsers(em: EntityManager, page: number, limit: number): Promise<[User[], total: number]> {
		const offset = (page - 1) * limit;
		return em.findAndCount(User, { isActive: true }, { offset, limit });
	}

	async updateUser(em: EntityManager, id: string, userData: EntityData<User>): Promise<User> {
		const user = await em.findOne(User, { id });

		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		em.assign(user, userData);
		await em.flush();
		return user;
	}

	async deleteUser(em: EntityManager, id: string): Promise<void> {
		const user = await em.findOne(User, { id });

		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		return em.removeAndFlush(user);
	}
}
