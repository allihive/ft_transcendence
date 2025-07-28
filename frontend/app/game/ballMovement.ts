import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { score } from "./scoring";

//get random angle for the ball
export function getInitialAngle(): number {
	const goingUp = Math.random() < 0.5 ? -1 : 1;
	const maxDeviationDeg = 45;
	const deviationRad = (Math.random() * maxDeviationDeg * 2 - maxDeviationDeg) * (Math.PI / 180);

	let angle: number;

	if (goingUp === -1) {
		angle = -Math.PI / 2 + deviationRad;
	} else {

		angle = Math.PI / 2 + deviationRad;
	}

	return angle;
}

// Predictive collision detection for paddle
function predictPaddleCollision(
  ballPos: Vector3,
  ballRadius: number,
  moveVector: Vector3,
  paddle: Mesh
): { hit: boolean; time: number; position: Vector3 } | null {
  const paddleBB = paddle.getBoundingInfo().boundingBox;
  const paddleMin = paddleBB.minimumWorld;
  const paddleMax = paddleBB.maximumWorld;


  let tZ = Infinity;
  let hitZ = false;
  
  if (moveVector.z !== 0) {
    const paddleZ = paddle.position.z > 0 ? paddleMin.z : paddleMax.z;
    tZ = (paddleZ - ballPos.z) / moveVector.z;
    
    if (tZ >= 0 && tZ <= 1) {
      const futureX = ballPos.x + moveVector.x * tZ;
      const futureY = ballPos.y + moveVector.y * tZ;
      
      if (futureX >= paddleMin.x - ballRadius && 
          futureX <= paddleMax.x + ballRadius &&
          futureY >= paddleMin.y - ballRadius && 
          futureY <= paddleMax.y + ballRadius) {
        hitZ = true;
      }
    }
  }

  if (hitZ && tZ < 1) {
    const collisionPos = ballPos.clone().add(moveVector.scale(tZ));
    return {
      hit: true,
      time: tZ,
      position: collisionPos
    };
  }

  return null;
}

export function handlePaddleCollision(
  ball: Mesh,
  paddle: Mesh,
  direction: Vector3,
  collisionPos: Vector3,
  isLeftPaddle: boolean 
) {
  const paddleBB = paddle.getBoundingInfo().boundingBox;
  const paddleCenter = paddle.position;
  const paddleHalfWidth = (paddleBB.maximum.x - paddleBB.minimum.x) / 2;

  const relativeHitX = (collisionPos.x - paddleCenter.x) / paddleHalfWidth;
  const clampedX = Math.max(-1, Math.min(1, relativeHitX));

  const maxBounceAngle = Math.PI / 4;

  const bounceAngle = clampedX * maxBounceAngle;

  const outZ = isLeftPaddle ? 1 : -1;

  const newDirX = Math.sin(bounceAngle);
  const newDirZ = Math.cos(bounceAngle) * outZ;

  direction.set(newDirX, 0, newDirZ);
  direction.normalize();

  ball.position.copyFrom(collisionPos);
  const offset = direction.scale(0.1);
  ball.position.addInPlace(offset);
}

export function isAABBColliding(a: Mesh, b: Mesh): boolean {
  const aMin = a.getBoundingInfo().boundingBox.minimumWorld;
  const aMax = a.getBoundingInfo().boundingBox.maximumWorld;

  const bMin = b.getBoundingInfo().boundingBox.minimumWorld;
  const bMax = b.getBoundingInfo().boundingBox.maximumWorld;

  return (
    aMin.x <= bMax.x &&
    aMax.x >= bMin.x &&
    aMin.y <= bMax.y &&
    aMax.y >= bMin.y &&
    aMin.z <= bMax.z &&
    aMax.z >= bMin.z
  );
}

//balls starts from centre and goes towards one end randomly angled
export function startBallMovement(
  scene: Scene,
  ball: Mesh,
  paddle1: Mesh,
  paddle2: Mesh,
  topwall1: Mesh,
  topwall2: Mesh,
  playersRef: React.RefObject<{ id: string; username: string; score: number }[]>,
  setPlayers: React.Dispatch<React.SetStateAction<{ id: string; username: string; score: number }[]>>,
  paddleMovementUpdate?: (deltaTime: number) => void
) {
 
  let angle = getInitialAngle();
  const direction = new Vector3(Math.cos(angle), 0, Math.sin(angle));

  let speed = { value: 0 }; // Start with 0 speed until countdown finishes
  let lastFrameTime = performance.now();
  
  const collisionCooldown = 100;
  const lastBounceTime = {
    paddle1: 0,
    paddle2: 0,
  };

  let lastSideWallBounceTime = 0;
  const sideWallCooldown = 100;
  const ballRadius = 0.2;

const timeoutCleanups: (() => void)[] = [];

let gameStarted = false;
let gameEnded = false;

const startInitialCountdown = () => {
  let countdown = 3;
  
  const countdownInterval = setInterval(() => {
    if ((window as any).showCountdown) {
      (window as any).showCountdown(countdown);
    }
    
    countdown--;
    
    if (countdown === 0) {
      clearInterval(countdownInterval);
      
      setTimeout(() => {

        if ((window as any).hideCountdown) {
          (window as any).hideCountdown();
        }
        

        gameStarted = true;
        speed.value = 3; 
        direction.set(Math.cos(angle), 0, Math.sin(angle));
      }, 1000); 
    }
  }, 1000);
  
  timeoutCleanups.push(() => clearInterval(countdownInterval));
};

// Set up global callback for game over
(window as any).endGame = () => {
  gameEnded = true;
};

startInitialCountdown();

const observer = scene.onBeforeRenderObservable.add(() => {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastFrameTime) / 1000;

  // Stop all game logic if game has ended
  if (gameEnded) {
    return;
  }

  if (paddleMovementUpdate) {
    paddleMovementUpdate(deltaTime);
  }

  if (gameStarted) {
    const moveVector = direction.clone().scale(speed.value * deltaTime);
    const ballPos = ball.position.clone();

    // === PREDICTIVE PADDLE COLLISION DETECTION ===
    let collisionHappened = false;
    
    // Check paddle1 collision
    if (direction.z > 0 && currentTime - lastBounceTime.paddle1 > collisionCooldown) {
      const collision = predictPaddleCollision(ballPos, ballRadius, moveVector, paddle1);
      if (collision) {
        handlePaddleCollision(ball, paddle1, direction, collision.position, false);

        speed.value += 0.2;
        lastBounceTime.paddle1 = currentTime;
        collisionHappened = true;
        

        if ((window as any).onBallSpeedIncrease) {
          (window as any).onBallSpeedIncrease(speed.value);
        }
      }
    }

    // Check paddle2 collision
    if (direction.z < 0 && !collisionHappened && currentTime - lastBounceTime.paddle2 > collisionCooldown) {
      const collision = predictPaddleCollision(ballPos, ballRadius, moveVector, paddle2);
      if (collision) {
        handlePaddleCollision(ball, paddle2, direction, collision.position, true);

        speed.value += 0.2;
        lastBounceTime.paddle2 = currentTime;
        collisionHappened = true;
        
        if ((window as any).onBallSpeedIncrease) {
          (window as any).onBallSpeedIncrease(speed.value);
        }
      }
    }

    if (!collisionHappened) {
      ball.position.addInPlace(moveVector);
    }

    // === SIDE WALL COLLISION ===
    const xLimit = 3.7;
    const isPastCooldown = currentTime - lastSideWallBounceTime > sideWallCooldown;

    if ((ball.position.x > xLimit || ball.position.x < -xLimit) && isPastCooldown) {
      direction.x *= -1;
      lastSideWallBounceTime = currentTime;

      if (ball.position.x > xLimit) {
        ball.position.x = xLimit - 0.05;
      } else if (ball.position.x < -xLimit) {
        ball.position.x = -xLimit + 0.05;
      }
    }

    // === SCORING LOGIC ===
    const zLimit = 6;
    if (ball.position.z < -zLimit || ball.position.z > zLimit) {
      if (playersRef.current) {
        const scoringCleanup = score(ball, topwall1, topwall2, angle, direction, speed, zLimit, playersRef.current, setPlayers);
        if (scoringCleanup && typeof scoringCleanup === 'function') {
          timeoutCleanups.push(scoringCleanup);
        }
      }
      // Original code (commented out due to TypeScript null check requirement)
      // const scoringCleanup = score(ball, topwall1, topwall2, angle, direction, speed, zLimit, playersRef.current, setPlayers);
      // if (scoringCleanup && typeof scoringCleanup === 'function') {
      //   timeoutCleanups.push(scoringCleanup);
      // }
    }
  }

  lastFrameTime = currentTime;
});

return () => {
  if (observer) {
    scene.onBeforeRenderObservable.remove(observer);
  }
  
  // Clean up global callback
  delete (window as any).endGame;
  
  // Clean up all timeout cleanups safely
  timeoutCleanups.forEach(cleanup => {
    if (typeof cleanup === 'function') {
      try {
        cleanup();
      } catch (error) {
        console.warn('Cleanup function error:', error);
      }
    }
  });
};

}

