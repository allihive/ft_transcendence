import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { randomUUID } from "crypto";

export enum AuthMethod {
	PASSWORD = "password",
	GOOGLE = "google"
};

@Entity({ tableName: "users" })
export class User {
	@PrimaryKey({ type: "uuid" })
	id: string = randomUUID();

	@Property({ type: "string", nullable: false, unique: true })
	email!: string;

	@Property({ type: "boolean", nullable: false, default: false, name: "email_verified" })
	emailVerified?: boolean;

	@Property({ type: "string", nullable: false, length: 100 })
	name!: string;

	@Property({ type: "string", nullable: false, unique: true, length: 30 })
	username!: string;

	@Property({ type: "string", nullable: true, length: 255, name: "password_hash" })
	passwordHash: string | null = null;

	@Property({ type: "string", nullable: false, default: AuthMethod.PASSWORD, name: "auth_method" })
	authMethod!: AuthMethod;

	@Property({ type: "text", nullable: false, name: "avatar_url" })
	avatarUrl!: string;

	@Property({ type: "boolean", nullable: false, default: true, name: "is_active" })
	isActive?: boolean;

	@Property({ type: "timestamptz", nullable: true, defaultRaw: "CURRENT_TIMESTAMP", name: "last_login" })
	lastLogin?: Date;

	@Property({ type: "timestamptz", nullable: false, defaultRaw: "CURRENT_TIMESTAMP", name: "created_at" })
	createdAt?: Date;

	@Property({
		type: "timestamptz",
		nullable: false,
		defaultRaw: "CURRENT_TIMESTAMP",
		onUpdate: () => new Date(),
		name: "updated_at"
	})
	updatedAt?: Date;
}
