import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Player } from "~/api/types";

type PlayersState = {
	players: Player[];
	setPlayers: (updateFn: (players: Player[]) => Player[]) => void;
	addPlayer: (player: Player) => void;
	removePlayer: (playerId: string) => void;
};

export const usePlayers = create<PlayersState>()(persist(
	(set) => ({
		players: [],
		setPlayers: (updateFn) => {
			set((state) => ({ players: updateFn(state.players)}))
		},

		addPlayer: (player: Player) => set((state) => {
			const exists = state.players.some(({ id }) => id === player.id);

			if (exists) {
				return state;
			}

			return { players: [...state.players, player] };
		}),

		removePlayer: (playerId: string) => set((state) => ({
			players: state.players.filter((player) => player.id !== playerId)
		}))
	}),
	{
		name: "players",
		storage: createJSONStorage(() => sessionStorage)
	}
));