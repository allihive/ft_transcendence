import { Mesh, StandardMaterial, Vector3, Color3 } from "babylonjs";
import { getInitialAngle } from "./ballMovement";

export function score(
	ball: Mesh,
	topwall1: Mesh,
	topwall2: Mesh,
	angle: number,
	direction: Vector3,
	speed: { value: number },
	zLimit: number
)
{
	let player1Score = false;
    let player2Score = false;
    if (ball.position.z < -zLimit && topwall1.material instanceof StandardMaterial) {
      (topwall1.material as StandardMaterial).diffuseColor = new Color3(1, 0, 0);
      player2Score = true;
    } else if (ball.position.z > zLimit && topwall2.material instanceof StandardMaterial) {
      (topwall2.material as StandardMaterial).diffuseColor = new Color3(1, 0, 0);
      player1Score = true;
    }
    // Reset the ball to the starting position and stop movement
    ball.position.set(0, 0.1, 0);
    angle = getInitialAngle();
    direction.set(Math.cos(angle), 0, Math.sin(angle));

    // Stop the movement temporarily
    speed.value = 0;

    // Change the color of the top walls to indicate scoring
    setTimeout(() => {
      if (player1Score) {
        (topwall2.material as StandardMaterial).diffuseColor = new Color3(1, 1, 0);
        player1Score = false;
      } else if (player2Score) {
        (topwall1.material as StandardMaterial).diffuseColor = new Color3(1, 1, 0);
        player2Score = false;
      }
    },500);
    // Wait for 1 seconds before resuming the game
    setTimeout(() => {
      // After 2 seconds, restart the ball's movement
      speed.value = 5;  // Reset the speed or adjust it as needed
      ball.position.set(0, 0.1, 0);  // Optionally reset position again
      direction.set(Math.cos(angle), 0, Math.sin(angle));  // Reset direction
    }, 1000);
}