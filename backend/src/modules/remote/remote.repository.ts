// src/modules/remote/remote.repository.ts
import { EntityData, EntityManager, RequiredEntityData } from "@mikro-orm/core";
import { RemoteGame } from "./entities/remote.entity";
import { Status } from './entities/remote.entity';
import { NotFoundException } from "../../common/exceptions/NotFoundException";

export class RemoteGameRepository {
	//create the database for new player
	async createRemoteGamePlayer(em: EntityManager, remoteGameData: RequiredEntityData<RemoteGame>): Promise<RemoteGame> {
		const remoteGame = em.create(RemoteGame, remoteGameData);
		await em.persistAndFlush(remoteGame);
		return remoteGame;
	}

	async findPlayer(em: EntityManager, where: Partial<RemoteGame>): Promise<RemoteGame | null> {
		return em.findOne(RemoteGame, where);
	}

	//update the player's status, rating and updatedAt
	async updateRemoteGamePlayer(em: EntityManager, playerId: string, playerData: EntityData<RemoteGame>): Promise<RemoteGame> {
		const player = await em.findOne(RemoteGame, { playerId });
		if (!player) {
			throw new NotFoundException(`Player with ID ${playerId} not found`);
		}
		em.assign(player, playerData);
		await em.flush();
		return player;
	}
	//find all online players
	async findAllOnlinePlayers(em: EntityManager): Promise<{ players: RemoteGame[]; count: number }> {
		const [players, count] = await em.findAndCount(RemoteGame, {
			status: Status.ONLINE,
		}, {
			orderBy: { rating: 'ASC' }
		});
		return { players, count };
	}

	async findAllOnlinePlayersExcluding(em: EntityManager, excludePlayerId: string): Promise<{ players: RemoteGame[]; count: number }> {
		const [players, count] = await em.findAndCount(RemoteGame, {
			status: Status.ONLINE,
			playerId: { $ne: excludePlayerId } // Exclude the specified player
		}, { orderBy: { rating: 'ASC' } });
		return { players, count };
	}
}