import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { randomUUID } from "crypto";
import { User } from "../../user/entities/user.entity";

@Entity({ tableName: "user_providers" })
export class UserProvider {
	@PrimaryKey({ type: "uuid" })
	id: string = randomUUID();

	@ManyToOne(() => User, { deleteRule: "cascade" })
	user!: User;

	@Property({ type: "string", nullable: false })
	provider!: string;

	@Property({ type: "string", unique: true, nullable: false, name: "provider_user_id" })
	providerUserId!: string;

	@Property({ type: "string", unique: true, nullable: false})
    email!: string;

	@Property({ type: "timestamptz", nullable: false, defaultRaw: "CURRENT_TIMESTAMP", name: "created_at" })
	createdAt?: Date;
}