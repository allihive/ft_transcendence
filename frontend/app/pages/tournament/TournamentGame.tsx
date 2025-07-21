import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, type JSX } from "react";
import { useTranslation } from 'react-i18next';
import { BabylonScene } from '../../game/BabylonScene';
import { toast } from "react-hot-toast";

export function TournamentGame(): JSX.Element {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [players, setPlayers] = useState([
		{ id: '', username: '', avatarUrl: '/files/default-avatar.png' },
		{ id: '', username: '', avatarUrl: '/files/default-avatar.png' }
	]);
	const [matchInfo, setMatchInfo] = useState<any>(null);

	useEffect(() => {
		// Get match info from localStorage which has full player data
		const tournamentMatchStr = localStorage.getItem('tournamentMatch');
		
		if (!tournamentMatchStr) {
			toast.error("Tournament match data not found");
			navigate("/tournament");
			return;
		}

		try {
			const storedMatchInfo = JSON.parse(tournamentMatchStr);
			
			// Use the full player data from localStorage
			const player1 = { 
				id: storedMatchInfo.player1.id, 
				username: storedMatchInfo.player1.name || storedMatchInfo.player1.username,
				avatarUrl: storedMatchInfo.player1.avatarUrl || '/files/default-avatar.png'
			};
			const player2 = { 
				id: storedMatchInfo.player2.id, 
				username: storedMatchInfo.player2.name || storedMatchInfo.player2.username,
				avatarUrl: storedMatchInfo.player2.avatarUrl || '/files/default-avatar.png'
			};
			
			setPlayers([player1, player2]);
			setMatchInfo(storedMatchInfo);

			// Set up game completion handler
			const handleGameComplete = (winner: string, scores?: { player1Score: number; player2Score: number }) => {
				
				// Determine which player won using the FULL player data from localStorage
				const winningPlayer = winner === player1.username ? storedMatchInfo.player1 : storedMatchInfo.player2;
			
				// Format the final score string
				const finalScore = scores ? `${scores.player1Score} - ${scores.player2Score}` : '';
				
				// Store the result for the bracket to process
				const result = {
					tournamentId: storedMatchInfo.tournamentId,
					matchId: storedMatchInfo.matchId,
					winner: winningPlayer,
					player1: storedMatchInfo.player1,
					player2: storedMatchInfo.player2,
					finalScore
				};

				// Store result in localStorage
				localStorage.setItem('tournamentResult', JSON.stringify(result));
				
				// Show completion message
				toast.success(`Match completed! ${winner} wins!`);
				
				// Navigate back to bracket after short delay
				setTimeout(() => {
					navigate(`/tournament/${storedMatchInfo.tournamentId}/bracket`);
				}, 1000);
			};

			// Override the global game over handler for tournament mode
			(window as any).setGameOverState = handleGameComplete;
			
			// Verify it was set


			return () => {
				// Clean up the override when component unmounts
				delete (window as any).setGameOverState;
			};
		} catch (error) {
			console.error('Failed to parse tournament match data:', error);
			toast.error("Invalid tournament match data");
			navigate("/tournament");
		}
	}, [navigate]);

	if (!players.length || !matchInfo) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<div className="text-lg font-title">Loading tournament match...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="tournament-game">
			{/* Tournament Match Header */}
			<div className="bg-lightOrange border-b-4 border-black p-4 text-center">
				<h1 className="text-2xl font-title font-bold text-black mb-2">
					Tournament Match
				</h1>
				<div className="flex justify-center items-center space-x-8 text-black font-title">
					<span className="font-bold">{players[0].username}</span>
					<span className="text-xl">VS</span>
					<span className="font-bold">{players[1].username}</span>
				</div>
			</div>

			{/* Game Instructions */}
			<div className="bg-gray-100 text-center py-2 text-sm text-gray-700">
				<p>{t('playInstructions')} | {t('firstTo5')}</p>
			</div>

			{/* Game Component */}
			<BabylonScene player1={players[0]} player2={players[1]} />
		</div>
	);
} 