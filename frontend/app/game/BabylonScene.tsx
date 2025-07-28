import { useEffect, useRef, useState, type JSX } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { createScene } from "./createScene";
import { paddleMovement } from "./paddleMovement";
import { startBallMovement } from "./ballMovement";
import type { Player } from "~/api/types";
import { upsertUserStats, updateUserRating, recordGame, type MatchResult, type CreateGameHistory } from "~/api/stats/upsertUserStats";

type BabylonSceneProps = {
	player1: Player;
	player2: Player;
	updateStats?: boolean;
};

export function BabylonScene({ player1, player2, updateStats = true }: BabylonSceneProps): JSX.Element {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const paddle1Ref = useRef<Mesh | null>(null);
	const paddle2Ref = useRef<Mesh | null>(null);
	const ballRef = useRef<Mesh | null>(null);
	const groupRef = useRef(null);
	const topwall1Ref = useRef<Mesh | null>(null);
	const topwall2Ref = useRef<Mesh | null>(null);
	const player1ScoreTextRef = useRef<any>(null);
	const player2ScoreTextRef = useRef<any>(null);

	const [players, setPlayers] = useState([
		{ id: player1.id, username: player1.username, score: 0 },
		{ id: player2.id, username: player2.username, score: 0 }
	]);

	const playersRef = useRef(players);
	const [gameEnded, setGameEnded] = useState(false);
	const [winnerName, setWinnerName] = useState<string | null>(null);
	const [countdown, setCountdown] = useState<number | null>(null);

	// Debug: Log state changes
	useEffect(() => {
		console.log('🎮 gameEnded state changed to:', gameEnded);
	}, [gameEnded]);

	useEffect(() => {
		console.log('🎮 winnerName state changed to:', winnerName);
	}, [winnerName]);

	// Keep score ref in sync
	useEffect(() => {
		playersRef.current = players;
	}, [players]);

	// Update GUI TextBlocks when score changes
	useEffect(() => {
		if (player1ScoreTextRef.current && player2ScoreTextRef.current) {
			player1ScoreTextRef.current.text = `${players[0].username}: ${players[0].score}`;
			player2ScoreTextRef.current.text = `${players[1].username}: ${players[1].score}`;
		}
	}, [players]);

	// Global game over trigger (tournament-aware)
	useEffect(() => {
		// Only set the default handler if one doesn't already exist (tournament mode)
		if (!(window as any).setGameOverState) {
			console.log('Setting default BabylonScene game over handler');
			(window as any).setGameOverState = async (winner: string, scores?: { player1Score: number; player2Score: number }) => {
				console.log('🎮 Game over called! Winner:', winner, 'Scores:', scores);
				console.log('🎮 Before setting states - gameEnded:', gameEnded, 'winnerName:', winnerName);
				
				setGameEnded(true);
				setWinnerName(winner);
				console.log('🎮 State setters called with setTimeout, should trigger re-render now');

				if (updateStats && scores) {
					console.log('🎮 Starting stats update...');
					// Find winner and loser players
					const winnerPlayer = [player1, player2].find(p => p.username === winner);
					const loserPlayer = [player1, player2].find(p => p.username !== winner);
					
					// Check if both players have UUID-like IDs (not just usernames)
					const isValidUUID = (id: string) => {
						return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
					};
					
					// check if the BOTH winner and loserPlayer are uuid or else it will just go through
					if (winnerPlayer && loserPlayer && isValidUUID(winnerPlayer.id) && isValidUUID(loserPlayer.id)) {
						// Update basic stats (wins/losses)
						await upsertUserStats(winnerPlayer.id, true);
						await upsertUserStats(loserPlayer.id, false);
						// Update ratings based on match result
						const matchResult: MatchResult = {
							winnerId: winnerPlayer.id,
							loserId: loserPlayer.id,
							winnerScore: winner === player1.username ? scores.player1Score : scores.player2Score,
							loserScore: winner === player1.username ? scores.player2Score : scores.player1Score
						};
						await updateUserRating(matchResult);
						// Record game in history
						const gameHistory: CreateGameHistory = {
							winnerId: winnerPlayer.id,
							loserId: loserPlayer.id,
							winnerScore: winner === player1.username ? scores.player1Score : scores.player2Score,
							loserScore: winner === player1.username ? scores.player2Score : scores.player1Score,
							local: false // This is an online game between real players
						};
						await recordGame(gameHistory);
						console.log('✅ User stats, ratings, and game history updated successfully');
					}
				}
			};
		} else {
			console.log('Tournament game over handler already exists, not overriding');
		}
	}, [player1, player2, updateStats]);

	// Global countdown functions
	useEffect(() => {
		(window as any).showCountdown = (number: number) => {
			setCountdown(number);
		};

		(window as any).hideCountdown = () => {
			setCountdown(null);
		};

		return () => {
			delete (window as any).showCountdown;
			delete (window as any).hideCountdown;
		};
	}, []);

	// Initialize Babylon scene
	useEffect(() => {
		if (!canvasRef.current) return;

		const engine = new Engine(canvasRef.current, true);

		const { scene, player1ScoreText, player2ScoreText } = createScene(
			engine,
			canvasRef.current,
			players,
			ballRef,
			paddle1Ref,
			paddle2Ref,
			groupRef,
			topwall1Ref,
			topwall2Ref,
			setPlayers
		);

		player1ScoreTextRef.current = player1ScoreText;
		player2ScoreTextRef.current = player2ScoreText;

		// Start paddle movement and get update function
		const paddleMovementSystem = paddleMovement(paddle1Ref, paddle2Ref);

		// Start ball movement and get cleanup function
		const ballMovementCleanup = startBallMovement(
			scene,
			ballRef.current!,
			paddle1Ref.current!,
			paddle2Ref.current!,
			topwall2Ref.current!,
			topwall1Ref.current!,
			playersRef,
			setPlayers,
			paddleMovementSystem.update // Pass the paddle update function
		);

		// Start render loop
		engine.runRenderLoop(() => scene.render());

		// Add resize listener
		const resizeHandler = () => engine.resize();
		window.addEventListener("resize", resizeHandler);

		return () => {
			// Cleanup paddle movement
			if (paddleMovementSystem.cleanup) {
				paddleMovementSystem.cleanup();
			}

			// Cleanup ball movement
			if (ballMovementCleanup) {
				ballMovementCleanup();
			}

			// Remove resize listener
			window.removeEventListener("resize", resizeHandler);

			// Dispose scene and engine
			scene.dispose();
			engine.dispose();
		};
	}, []);

	return (
		<div className="w-[calc(100vw-120px)] h-[80vh] max-w-[calc(100vw-120px)] mx-auto overflow-hidden relative border-2 border-white">
			<canvas
				ref={canvasRef}
				className="w-full h-full block bg-black"
			/>

			{/* Countdown overlay */}
			{countdown !== null && (
				<div className="absolute z-50 w-full h-full top-0 flex items-center justify-center pointer-events-none">
					<div className="text-[8rem] font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse">
						{countdown}
					</div>
				</div>
			)}

			{/* Game over overlay */}
			{gameEnded && (
				<div className="absolute z-50 w-full h-full top-0 bg-black/80 text-white text-5xl flex flex-col items-center justify-center">
					<h1>GAME OVER</h1>
					<h2 className="text-3xl mt-4">Winner is {winnerName}</h2>
				</div>
			)}
		</div>
	);
};
