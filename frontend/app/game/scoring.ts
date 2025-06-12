import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { getInitialAngle } from "./ballMovement";

export function score(
  ball: Mesh,
  topwall1: Mesh,
  topwall2: Mesh,
  angle: number,
  direction: Vector3,
  speed: { value: number },
  zLimit: number,
  players: { id: string; username: string; score: number }[],
  setPlayers: React.Dispatch<React.SetStateAction<{ id: string; username: string; score: number }[]>>,
) {


  let player1Score = false;
  let player2Score = false;

  // Detect who scored
  if (ball.position.z < -zLimit && topwall1.material instanceof StandardMaterial) {
    (topwall1.material as StandardMaterial).diffuseColor = new Color3(1, 0, 0); 
    player1Score = true;
  } else if (ball.position.z > zLimit && topwall2.material instanceof StandardMaterial) {
    (topwall2.material as StandardMaterial).diffuseColor = new Color3(1, 0, 0);
    player2Score = true;
  }

  if (player1Score || player2Score) {
    // Reset ball
    ball.position.set(0, 0.1, 0);
    angle = getInitialAngle();
    direction.set(Math.cos(angle), 0, Math.sin(angle));
    speed.value = 0;

    // Delay score update to show wall color
    setTimeout(() => {
      setPlayers(prev => {
        const updatedPlayers = [...prev];
        let winner: string | null = null;

        if (player1Score) {
          (topwall2.material as StandardMaterial).diffuseColor = new Color3(1, 1, 0); // reset wall
          updatedPlayers[0].score++;
          player1Score = false;
        } else if (player2Score) {
          (topwall1.material as StandardMaterial).diffuseColor = new Color3(1, 1, 0);
          updatedPlayers[1].score++;
          player2Score = false;
        }

        // Check for win condition
        if (updatedPlayers[0].score >= 10) {
          winner = updatedPlayers[0].username;
        } else if (updatedPlayers[1].score >= 10) {
          winner = updatedPlayers[1].username;
        }

        if (winner) {
          speed.value = 0;
          setTimeout(() => {
            (window as any).setGameOverState?.(winner);
          }, 500);
        } else {
          // Resume play after 1 sec if no winner
          setTimeout(() => {
            speed.value = 5;
            direction.set(Math.cos(angle), 0, Math.sin(angle));
          }, 1000);
        }

        return updatedPlayers;
      });
    }, 500);
  }
}
