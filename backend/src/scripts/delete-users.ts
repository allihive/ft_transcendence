import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "../../mikro-orm.config";
import { User } from "../modules/user/entities/user.entity";

async function deleteUsers() {
	const orm = await MikroORM.init(mikroConfig);
	const em = orm.em;

	try {
		// Option 1: Delete all users
		await em.nativeDelete(User, {});
		console.log('✅ All users deleted');

		// Option 2: Delete specific user by username
		// await em.nativeDelete(User, { username: 'specific_username' });
		// console.log('✅ User deleted');

		// Option 3: Delete users by email pattern
		// await em.nativeDelete(User, { email: { $like: '%@example.com' } });
		// console.log('✅ Test users deleted');

	} catch (error) {
		console.error('❌ Error deleting users:', error);
	} finally {
		await orm.close();
	}
}

deleteUsers(); 