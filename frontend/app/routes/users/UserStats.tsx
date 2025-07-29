// import type { Route } from "./+types/home";
import { UsersStats } from "../../pages/users/UsersStatsTab";
import type { UserStats } from "~/api/types";
import { getUserStats } from "~/api/stats/getUserStats";
import type { getUserMatchHistory } from "~/api/stats/types";
import { useAuth } from "~/stores/useAuth";
import { useLoaderData } from "react-router";
import { getUserMatches } from "~/api/stats/getUserMatches";
import { useState } from "react";

export async function clientLoader(): Promise<{
  userStats: any[];
  userMatchHistory: getUserMatchHistory[];
}> {
  /*Hard coded user data*/
  // return {
  // 	userStats: [{ name: "win", matchesPlayed: 100, percentage: 60 },
  // 		{ name: "loss", matchesPlayed: 100, percentage: 40}],
  // 	userMatchHistory: [{
  // 							matchId: "jklsdfkjioejd233",
  // 							date: "6-25-25",
  // 							opponent: 123234332,
  // 							playerScore: 5,
  // 							opponentScore: 4,
  // 							result: 'WIN'}]
  // };
  /*Fake user data working*/
  // const userStat = await getUserStats("879864fb-3120-4e85-953c-12736096f88d");
  // const userMatchHistory = await getUserMatches("879864fb-3120-4e85-953c-12736096f90d");

  // if (!userStat || !userMatchHistory) {
  // 	return {
  // 		userStats: [],
  // 		userMatchHistory: []
  // 	};
  // }

  // return {
  // 	userStats: [
  // 		{ name: "win", matchesPlayed: 100, percentage: userStat.winRate },
  // 		{ name: "loss", matchesPlayed: 100, percentage: 100 - userStat.winRate }
  // 	],
  // 	userMatchHistory: userMatchHistory // This is now an array of matches
  // }
  // }
  /*With real user data */
  const user = useAuth.getState().user;
  if (!user) {
	return {
		userStats: [],
		userMatchHistory: []
	}
  }
  try {
	  const userStat = await getUserStats(user?.id);
	  const userMatchHistory = await getUserMatches(user?.id);
	  
	  console.log(user.id);
	  console.log(userStat?.winRate);
	  if (!userStat || !userMatchHistory) {
		return {
		  userStats: [],
		  userMatchHistory: [],
		};
	  }
	
	  return {
		userStats: [
		  { name: "win", matchesPlayed: userStat.matchesPlayed, percentage: userStat.winRate },
		  { name: "loss", matchesPlayed: userStat.matchesPlayed, percentage: 100 - userStat.winRate },
		],
		userMatchHistory: userMatchHistory, // This is now an array of matches
	  };
	}
	catch (error) {
		console.error("Error loading user data:", error);
		return{
			userStats: [],
			userMatchHistory: []
		}
	  }
  }

export default function Users() {
  const { userStats, userMatchHistory } = useLoaderData();
	console.log(userStats);

  return (
    <UsersStats userStats={userStats} userMatchHistory={userMatchHistory} />
  );
}
