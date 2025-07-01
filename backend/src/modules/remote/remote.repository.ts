// src/modules/remote/remote.repository.ts
import { EntityRepository } from "@mikro-orm/sqlite";
import { RemoteGame } from "./entities/remote.entity";

export class RemoteGameRepository extends EntityRepository<RemoteGame> {
	
}