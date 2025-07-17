import { useEffect, useRef, useState, type JSX } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { createScene } from "./createScene";
import { paddleMovement } from "./paddleMovement";
import { startBallMovement } from "./ballMovement";
import "./Scene.css";
import type { Player } from "~/api/types";

type BabylonSceneProps = {
	player1: Player;
	player2: Player;
}

export function BabylonScene({ player1, player2 }: BabylonSceneProps): JSX.Element {
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

	// Global game over trigger
	useEffect(() => {
		(window as any).setGameOverState = (winner: string) => {
			setGameEnded(true);
			setWinnerName(winner);
		};
	}, []);

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
		<div className="scene-container">
			<canvas
				ref={canvasRef}
				style={{
					width: "100%",
					height: "100%",
					maxWidth: "100%",
					maxHeight: "100vh",
					display: "block"
				}}
			/>

			{/* Countdown overlay */}
			{countdown !== null && (
				<div className="countdown-overlay">
					<div className="countdown-number">{countdown}</div>
				</div>
			)}

			{/* Game over overlay */}
			{gameEnded && (
				<div className="game-over">
					<h1>GAME OVER</h1>
					<h2>Winner is {winnerName}</h2>
				</div>
			)}
		</div>
	);
};
