import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { randomUUID } from "crypto";
import { User } from "../../user/entities/user.entity";

@Entity({ tableName: "user_providers" })
export class UserProvider {
	/** Unique identifier for each provider entry. */
	@PrimaryKey({ type: "uuid" })
	id: string = randomUUID();

	/** Links to the users table, associating a provider with a user. */
	@ManyToOne(() => User, { deleteRule: "cascade" })
	user!: User;

	/** Name of the authentication provider (e.g: google, github). */
	@Property({ type: "string", unique: true, nullable: false })
	provider!: string;

	/** The unique user ID from the provider (e.g., Google’s sub field in OAuth). */
	@Property({ type: "string", unique: true, nullable: false, name: "provider_user_id" })
	providerUserId!: string;

	/** Optional email from the provider */
	@Property({ type: "string", nullable: true })
	email?: string;

	/** The OAuth access token, which can be used for API requests. */
	@Property({ type: "text", nullable: true, name: "access_token" })
	accessToken?: string;

	/** The refresh token, allowing renewal of the access token. */
	@Property({ type: "text", nullable: true, name: "refresh_token" })
	refreshToken?: string;

	/** Timestamp for when the provider entry was created. */
	@Property({ type: "timestamptz", nullable: false, defaultRaw: "CURRENT_TIMESTAMP", name: "created_at" })
	createdAt?: Date;
}