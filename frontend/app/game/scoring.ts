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
  let wallToReset: Mesh | null = null;

  // Detect who scored based on ball position
  if (ball.position.z < -zLimit && topwall2.material instanceof StandardMaterial) {
    (topwall2.material as StandardMaterial).diffuseColor = new Color3(1, 0, 0); 
    player1Score = true;
    wallToReset = topwall2;
  } else if (ball.position.z > zLimit && topwall1.material instanceof StandardMaterial) {
    (topwall1.material as StandardMaterial).diffuseColor = new Color3(1, 0, 0);
    player2Score = true;
    wallToReset = topwall1;
  }

  if (player1Score || player2Score) {
    // Reset ball
    ball.position.set(0, 0.1, 0);
    angle = getInitialAngle();
    direction.set(Math.cos(angle), 0, Math.sin(angle));
    speed.value = 0;

    // Store timeout IDs for cleanup
    const timeoutIds: NodeJS.Timeout[] = [];

    // Delay score update to show wall color
    const scoreUpdateTimeout = setTimeout(() => {
      setPlayers(prev => {
        console.log('scoreUpdateTimeout called');
        
        const updatedPlayers = [...prev];
        let winner: string | null = null;

        // Reset the correct wall color back to yellow
        if (wallToReset && wallToReset.material instanceof StandardMaterial) {
          (wallToReset.material as StandardMaterial).diffuseColor = new Color3(1, 1, 0);
        }

        // Update scores
        if (player1Score) {
          updatedPlayers[0].score += 0.5;
          console.log('player 1 scored');
        } else if (player2Score) {
          updatedPlayers[1].score += 0.5;
          console.log('player 2 scored');
        }

        // Check for win condition
        if (updatedPlayers[0].score >= 5) {
          winner = updatedPlayers[0].username;
        } else if (updatedPlayers[1].score >= 5) {
          winner = updatedPlayers[1].username;
        }

        if (winner) {
          speed.value = 0;
          const gameOverTimeout = setTimeout(() => {
            (window as any).setGameOverState?.(winner);
          }, 500);
          timeoutIds.push(gameOverTimeout);
        } else {
          // Start countdown from 3 to 1
          let countdown = 3;
          
          const countdownInterval = setInterval(() => {
            // Show countdown in UI
            if ((window as any).showCountdown) {
              (window as any).showCountdown(countdown);
            }
            
            countdown--;
            
            if (countdown === 0) {
              clearInterval(countdownInterval);
              
              // Add a small delay after showing "1" before starting ball
              setTimeout(() => {
                // Hide countdown and start ball
                if ((window as any).hideCountdown) {
                  (window as any).hideCountdown();
                }
                
                // Resume play after countdown
                speed.value = 3; // Reset to starting speed
                direction.set(Math.cos(angle), 0, Math.sin(angle));
              }, 1000); // Wait 1 second after showing "1"
            }
          }, 1000);
          timeoutIds.push(countdownInterval);
        }

        return updatedPlayers;
      });
    }, 500);
    timeoutIds.push(scoreUpdateTimeout);

    // Return cleanup function for timeouts
    return () => {
      timeoutIds.forEach(id => {
        try {
          clearTimeout(id);
          clearInterval(id);
        } catch (error) {
          // Ignore errors if the ID doesn't exist
        }
      });
    };
  }

  // Return empty cleanup function if no scoring occurred
  return () => {};
}
