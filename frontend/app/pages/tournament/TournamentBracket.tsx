import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, type JSX } from "react";
import { useTournament } from "~/stores/useTournament";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { GiLaurelsTrophy } from "react-icons/gi";


{/*
This represents the bracket of a tournament.

It is a tree of matches, where each match has two players.

The matches are stored in the tournament store.

The matches are rendered in a tree structure, where each match is a node in the tree.

*/}

interface BracketMatch {
	id: string;
	roundNumber: number;
	matchNumber: number;
	player1: any | null;
	player2: any | null;
	winner: any | null;
	status: 'pending' | 'in_progress' | 'completed';
	nextMatchId?: string;
	finalScore?: string;
	gamesWon: {
		player1: number;
		player2: number;
	};
	requiredWins: number;
}

{/*
This represents a single match in the bracket.

It is a card that displays the two players and the winner of the match.
*/}

interface MatchCardProps {
	match: BracketMatch;
	roundName: string;
	compact?: boolean;
	onStartMatch?: (match: BracketMatch) => void;
	canStart?: boolean;
}

const MatchCard = ({ match, roundName, compact = false, onStartMatch, canStart = false }: MatchCardProps): JSX.Element => {
	const getPlayerDisplay = (player: any) => {
		if (!player) return "TBD";
		const playerName = player.name || player.username || 'Unknown';
		return playerName;
	};

	const getSeriesDisplay = (match: BracketMatch) => {
		const { gamesWon, player1, player2 } = match;
		const p1Wins = gamesWon.player1;
		const p2Wins = gamesWon.player2;
		
		if (p1Wins === 0 && p2Wins === 0) return "Draw 0-0";
		if (p1Wins === p2Wins) return `Draw ${p1Wins}-${p2Wins}`;
		if (p1Wins > p2Wins) return `${player1?.username} leads ${p1Wins}-${p2Wins}`;
		if (p2Wins > p1Wins) return `${player2?.username} leads ${p2Wins}-${p1Wins}`;
		return `Draw ${p1Wins}-${p2Wins}`;
	};

	const getButtonText = (match: BracketMatch) => {
		if (match.status === 'pending') return "START MATCH";
		if (match.status === 'in_progress') return "PLAY NEXT GAME";
		return null; // completed
	};

	const getWinnerName = (winner: any) => {
		if (!winner) return 'Unknown';
		return winner.name || winner.username || 'Unknown';
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 border-green-400';
			case 'in_progress':
				return 'bg-yellow-100 border-yellow-400';
			default:
				return 'bg-gray-100 border-gray-400';
		}
	};

	const cardWidth = compact ? 'min-w-[160px]' : 'min-w-[200px]';
	const padding = compact ? 'p-2' : 'p-3';
	const textSize = compact ? 'text-xs' : 'text-sm';

	const hasPlayers = match.player1 && match.player2;
	const canStartMatch = canStart && hasPlayers && match.status === 'pending';

	return (
		<div className={`border-2 rounded-lg ${padding} m-2 ${cardWidth} ${getStatusColor(match.status)}`}>
			<div className={`${compact ? 'text-xs' : 'text-xs'} font-bold text-center mb-2 text-gray-600`}>
				{compact ? `M${match.matchNumber}` : `${roundName} - Match ${match.matchNumber}`}
			</div>
			
			<div className="space-y-1">
				<div className={`p-1 rounded border ${match.winner?.id === match.player1?.id ? 'bg-green-200 font-bold' : 'bg-white'}`}>
					<div className={`${textSize} font-title truncate`}>
						{getPlayerDisplay(match.player1)}
					</div>
				</div>
				
				<div className="text-center text-xs text-gray-500">VS</div>
				
				<div className={`p-1 rounded border ${match.winner?.id === match.player2?.id ? 'bg-green-200 font-bold' : 'bg-white'}`}>
					<div className={`${textSize} font-title truncate`}>
						{getPlayerDisplay(match.player2)}
					</div>
				</div>
			</div>

			{/* Series Status */}
			{match.status !== 'pending' && (
				<div className="text-center text-xs text-gray-600 mt-2">
					{getSeriesDisplay(match)}
				</div>
			)}

			{/* Action Button */}
			{getButtonText(match) && onStartMatch && (
				<div className="mt-2 text-center">
					<button
						onClick={() => onStartMatch(match)}
						className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded border border-black transition-colors"
					>
						{getButtonText(match)}
					</button>
				</div>
			)}

			{match.status === 'completed' && match.winner && (
				<div className="mt-2 text-center">
					<span className="text-xs font-bold text-green-600 truncate block">
						{compact ? getWinnerName(match.winner) : `Winner: ${getWinnerName(match.winner)}`}
					</span>
					{match.finalScore && (
						<div className="text-xs text-gray-600 mt-1">
							Score: {match.finalScore}
						</div>
					)}
				</div>
			)}

			{match.status === 'in_progress' && (
				<div className="mt-2 text-center">
					<span className="text-xs font-bold text-yellow-600">
						In Progress...
					</span>
				</div>
			)}
		</div>
	);
};

export function TournamentBracket(): JSX.Element {
	const { tournamentId } = useParams<{ tournamentId: string }>();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { getTournamentById, updateMatchResult } = useTournament();

	// Get tournament directly from store (Zustand)
	const tournament = tournamentId ? getTournamentById(tournamentId) : null;
	
	useEffect(() => {
		if (tournamentId && !tournament) {
			toast.error("Tournament not found");
			navigate("/tournament");
		}

		// Check for tournament result from completed game
		const resultStr = localStorage.getItem('tournamentResult');
		if (resultStr) {
			try {
				const result = JSON.parse(resultStr);
				if (result.tournamentId === tournamentId) {
					// Process the match result
					processTournamentResult(result);
					// Clear the result
					localStorage.removeItem('tournamentResult');
				}
			} catch (error) {
				console.error('Failed to process tournament result:', error);
			}
		}
	}, [tournamentId, getTournamentById, navigate, updateMatchResult]);

	// Process tournament match result
	const processTournamentResult = (result: any) => {
		// Update the tournament store with the match result
		const updatedTournament = updateMatchResult(result.tournamentId, result.matchId, result.winner, result.finalScore);
		
		if (updatedTournament) {
			toast.success(`Match completed! ${result.winner.username} advances to the next round.`);
		} else {
			console.error('Failed to update tournament - updateMatchResult returned null');
			toast.error("Failed to update tournament bracket");
		}
	};

	if (!tournament || !tournament.bracket) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<div className="text-lg font-title">Loading tournament bracket...</div>
				</div>
			</div>
		);
	}

	const { bracket } = tournament;

	const getRoundName = (roundNumber: number, totalRounds: number) => {
		if (roundNumber === totalRounds) return "Final";
		if (roundNumber === totalRounds - 1) return "Semifinals";
		if (roundNumber === totalRounds - 2) return "Quarterfinals";
		if (roundNumber === 1 && totalRounds === 4) return "Round of 16";
		return `Round ${roundNumber}`;
	};

	const getMatchesForRound = (roundNumber: number) => {
		return bracket.matches.filter((match: BracketMatch) => match.roundNumber === roundNumber);
	};

	// Check if a round can be started (all previous rounds completed)
	const canRoundStart = (roundNumber: number): boolean => {
		if (roundNumber === 1) return true; // First round can always start
		
		// Check if all matches in previous round are completed
		const previousRoundMatches = getMatchesForRound(roundNumber - 1);
		return previousRoundMatches.every(match => match.status === 'completed');
	};

	// Check if a match can be started or continued
	const canStartOrContinueMatch = (match: BracketMatch): boolean => {
		// Can start if pending and round can start
		if (match.status === 'pending') {
			return canRoundStart(match.roundNumber);
		}
		// Can continue if in progress (series not complete)
		if (match.status === 'in_progress') {
			return true;
		}
		return false;
	};

	// Handle starting a match
	const handleStartMatch = (match: BracketMatch) => {
		if (!match.player1 || !match.player2) {
			toast.error("Both players must be available to start the match");
			return;
		}

		// Store match info for when game completes (includes full player data with stats)
		const matchInfo = {
			tournamentId,
			matchId: match.id,
			player1: match.player1,  // Full player data including stats
			player2: match.player2,  // Full player data including stats
			bestOf: tournament.bestOf // Pass the tournament's bestOf setting
		};
		
		// Store in localStorage so the game can access the complete player data
		localStorage.setItem('tournamentMatch', JSON.stringify(matchInfo));

		// Navigate to tournament game (no need for URL parameters now)
		navigate('/tournament-game');
	};

	// Render different layouts based on tournament size
	const renderBracketLayout = () => {
		if (bracket.rounds === 2) {
			// 4 players: Semifinals + Final
			const semifinals = getMatchesForRound(1);
			const final = getMatchesForRound(2);

			return (
				<div className="flex justify-center items-center space-x-12">
					{/* Semifinals */}
					<div className="flex flex-col items-center">
						<h3 className="text-lg font-title font-bold mb-4 text-darkOrange">Semifinals</h3>
						<div className="flex flex-col space-y-8">
							{semifinals.map(match => (
								<MatchCard 
									key={match.id} 
									match={match} 
									roundName="Semifinals" 
									onStartMatch={handleStartMatch}
									canStart={canStartOrContinueMatch(match)}
								/>
							))}
						</div>
					</div>

					{/* Connection lines would go here in a more advanced implementation */}
					
					{/* Final */}
					<div className="flex flex-col items-center">
						<h3 className="text-lg font-title font-bold mb-4 text-darkOrange">Final</h3>
						<div className="flex items-center" style={{ height: '280px' }}>
							{final.map(match => (
								<MatchCard 
									key={match.id} 
									match={match} 
									roundName="Final" 
									onStartMatch={handleStartMatch}
									canStart={canStartOrContinueMatch(match)}
								/>
							))}
						</div>
					</div>
				</div>
			);
		} else if (bracket.rounds === 3) {
			// 8 players: Quarterfinals + Semifinals + Final
			const quarterfinals = getMatchesForRound(1);
			const semifinals = getMatchesForRound(2);
			const final = getMatchesForRound(3);

			return (
				<div className="flex justify-center items-center space-x-8">
					{/* Quarterfinals */}
					<div className="flex flex-col items-center">
						<h3 className="text-lg font-title font-bold mb-4 text-darkOrange">Quarterfinals</h3>
						<div className="flex flex-col space-y-4">
							{quarterfinals.map(match => (
								<MatchCard 
									key={match.id} 
									match={match} 
									roundName="Quarterfinals" 
									compact 
									onStartMatch={handleStartMatch}
									canStart={canStartOrContinueMatch(match)}
								/>
							))}
						</div>
					</div>

					{/* Semifinals - positioned between quarterfinals */}
					<div className="flex flex-col items-center">
						<h3 className="text-lg font-title font-bold mb-4 text-darkOrange">Semifinals</h3>
						<div className="flex flex-col justify-center space-y-12" style={{ height: '400px' }}>
							{semifinals.map((match, index) => (
								<div key={match.id} className="flex items-center">
									<MatchCard 
										match={match} 
										roundName="Semifinals" 
										onStartMatch={handleStartMatch}
										canStart={canStartOrContinueMatch(match)}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Final - centered */}
					<div className="flex flex-col items-center">
						<h3 className="text-lg font-title font-bold mb-4 text-darkOrange">Final</h3>
						<div className="flex items-center justify-center" style={{ height: '400px' }}>
							{final.map(match => (
								<MatchCard 
									key={match.id} 
									match={match} 
									roundName="Final" 
									onStartMatch={handleStartMatch}
									canStart={canStartOrContinueMatch(match)}
								/>
							))}
						</div>
					</div>
				</div>
			);
		} else if (bracket.rounds === 4) {
			// 16 players: Round of 16 + Quarterfinals + Semifinals + Final
			const roundOf16 = getMatchesForRound(1);
			const quarterfinals = getMatchesForRound(2);
			const semifinals = getMatchesForRound(3);
			const final = getMatchesForRound(4);

			return (
				<div className="flex justify-center items-center space-x-6">
					{/* Round of 16 */}
					<div className="flex flex-col items-center">
						<h3 className="text-lg font-title font-bold mb-4 text-darkOrange">Round of 16</h3>
						<div className="flex flex-col space-y-2">
							{roundOf16.map(match => (
								<MatchCard 
									key={match.id} 
									match={match} 
									roundName="R16" 
									compact 
									onStartMatch={handleStartMatch}
									canStart={canStartOrContinueMatch(match)}
								/>
							))}
						</div>
					</div>

					{/* Quarterfinals - positioned between round of 16 groups */}
					<div className="flex flex-col items-center">
						<h3 className="text-lg font-title font-bold mb-4 text-darkOrange">Quarterfinals</h3>
						<div className="flex flex-col justify-center space-y-8" style={{ height: '600px' }}>
							{quarterfinals.map(match => (
								<MatchCard 
									key={match.id} 
									match={match} 
									roundName="Quarterfinals" 
									compact 
									onStartMatch={handleStartMatch}
									canStart={canStartOrContinueMatch(match)}
								/>
							))}
						</div>
					</div>

					{/* Semifinals - positioned between quarterfinals */}
					<div className="flex flex-col items-center">
						<h3 className="text-lg font-title font-bold mb-4 text-darkOrange">Semifinals</h3>
						<div className="flex flex-col justify-center space-y-16" style={{ height: '600px' }}>
							{semifinals.map(match => (
								<MatchCard 
									key={match.id} 
									match={match} 
									roundName="Semifinals" 
									onStartMatch={handleStartMatch}
									canStart={canStartOrContinueMatch(match)}
								/>
							))}
						</div>
					</div>

					{/* Final - centered */}
					<div className="flex flex-col items-center">
						<h3 className="text-lg font-title font-bold mb-4 text-darkOrange">Final</h3>
						<div className="flex items-center justify-center" style={{ height: '600px' }}>
							{final.map(match => (
								<MatchCard 
									key={match.id} 
									match={match} 
									roundName="Final" 
									onStartMatch={handleStartMatch}
									canStart={canStartOrContinueMatch(match)}
								/>
							))}
						</div>
					</div>
				</div>
			);
		}

		return null;
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4">
				{/* Header */}
				<div className="text-center mb-8">
					<button
						onClick={() => navigate("/tournament")}
						className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black font-title rounded border-2 border-black transition-colors"
					>
						← Back to Tournaments
					</button>
					
					<h1 className="text-3xl font-title font-bold mb-2">{tournament.name}</h1>
					<p className="text-gray-600">Tournament Bracket</p>
					
					<div className="flex justify-center items-center mt-4 space-x-6 text-sm">
						<span className="font-bold">Players: {tournament.participants}</span>
						<span className="font-bold">Best of {tournament.bestOf}</span>
						<span className={`px-3 py-1 rounded-full font-bold ${
							tournament.status === 'in-progress' 
								? 'bg-yellow-100 text-yellow-800' 
								: tournament.status === 'completed'
								? 'bg-green-100 text-green-800'
								: 'bg-gray-100 text-gray-800'
						}`}>
							{tournament.status === 'in-progress' ? 'In Progress' : 
							 tournament.status === 'completed' ? 'Completed' : 'Waiting'}
						</span>
					</div>
				</div>

				{/* Bracket Visualization */}
				<div className="overflow-x-auto">
					<div className="min-w-max px-4">
						{renderBracketLayout()}
					</div>
				</div>

				{/* Tournament Champion */}
				{tournament.status === 'completed' && (
					<div className="text-center mt-8">
						<div className="bg-yellow-100 border-4 border-yellow-400 rounded-lg p-6 max-w-md mx-auto">
							<GiLaurelsTrophy size={48} className="mx-auto text-yellow-600 mb-4" />
							<h2 className="text-2xl font-title font-bold text-yellow-800 mb-2">
								🏆 Tournament Champion 🏆
							</h2>
							<p className="text-lg font-bold">
								{/* This would be the winner of the final match */}
								Tournament Winner
							</p>
						</div>
					</div>
				)}

				{/* Instructions */}
				<div className="mt-8 text-center text-sm text-gray-600">
					<p>Click "START MATCH" to begin a game between the two players. Matches can only be started when the previous round is completed.</p>
				</div>

				{/* Legend */}
				<div className="mt-4 text-center">
					<div className="inline-flex space-x-6 text-sm">
						<div className="flex items-center space-x-2">
							<div className="w-4 h-4 bg-gray-100 border border-gray-400 rounded"></div>
							<span>Pending</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded"></div>
							<span>In Progress</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
							<span>Completed</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
} 