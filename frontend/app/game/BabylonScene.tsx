import React, { useEffect, useRef, useState } from 'react';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { createScene } from './createScene';
import { paddleMovement } from './paddleMovement';
import { startBallMovement } from './ballMovement';
import './Scene.css';

interface Player {
  id: string;
  username: string;
}

interface BabylonSceneProps {
  player1: Player;
  player2: Player;
}

const BabylonScene: React.FC<BabylonSceneProps> = ({ player1, player2 }) => {
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

    startBallMovement(
      scene,
      ballRef.current!,
      paddle1Ref.current!,
      paddle2Ref.current!,
      topwall1Ref.current!,
      topwall2Ref.current!,
      playersRef,
      setPlayers
    );

    paddleMovement(paddle1Ref, paddle2Ref);

    engine.runRenderLoop(() => scene.render());
    window.addEventListener('resize', () => engine.resize());

    return () => {
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <div className="scene-container">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {gameEnded && (
        <div className="game-over">
          <h1>GAME OVER</h1>
          <h2>Winner is {winnerName}</h2>
        </div>
      )}
    </div>
  );
};

export default BabylonScene;
