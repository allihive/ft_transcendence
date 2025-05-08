import { Mesh, Scene, Vector3} from "babylonjs";
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

//this function should handle the collision between the ball and the paddle

export function handlePaddleCollision(
  ball: Mesh,
  paddle: Mesh,
  direction: Vector3,
  isLeftPaddle: boolean 
) {
  const paddleBB = paddle.getBoundingInfo().boundingBox;
  const paddleCenter = paddle.position;
  const paddleHalfWidth = (paddleBB.maximum.x - paddleBB.minimum.x) / 2;

  // where the ball hit the paddle
  const relativeHitX = (ball.position.x - paddleCenter.x) / paddleHalfWidth;
  const clampedX = Math.max(-1, Math.min(1, relativeHitX));

  
  const maxBounceAngle = Math.PI / 4; // 45 degrees

  // Calculate bounce angle based on X hit
  const bounceAngle = clampedX * maxBounceAngle;

  // Forward direction (Z)
  const outZ = isLeftPaddle ? 1 : -1;

  // Compute new direction vector on X-Z plane
  const newDirX = Math.sin(bounceAngle);
  const newDirZ = Math.cos(bounceAngle) * outZ;

  direction.set(newDirX, 0, newDirZ);
  direction.normalize();

  // Prevent sticking
  const pushBack = direction.scale(0.2);
  ball.position.addInPlace(pushBack);
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



function checkAndHandlePaddleCollision(
  ball: Mesh,
  paddle: Mesh,
  direction: Vector3,
  collisionRef: { value: boolean },
  lastBounceKey: 'paddle1' | 'paddle2',
  lastBounceTime: { paddle1: number; paddle2: number },
  collisionCooldown: number,
  speed: { value: number },
  isLeftPaddle: boolean
) {
  const isColliding = isAABBColliding(ball, paddle);
  const now = performance.now();

  if (isColliding && !collisionRef.value && now - lastBounceTime[lastBounceKey] > collisionCooldown) {
    // Collision happened, handle the collision
    handlePaddleCollision(ball, paddle, direction, isLeftPaddle);;
    
    // Increase speed after collision
    speed.value += 0.5;

    // Update the last bounce time for cooldown
    lastBounceTime[lastBounceKey] = now;
  }

  // Update the collision state for the next frame
  collisionRef.value = isColliding;
}


//balls starts from centre and goes towards one end randomly angled
export function startBallMovement(
  scene: Scene,
  ball: Mesh,
  paddle1: Mesh,
  paddle2: Mesh,
  topwall1: Mesh,
  topwall2: Mesh
) {
 
  let angle = getInitialAngle();
  const direction = new Vector3(Math.cos(angle), 0, Math.sin(angle));


  let speed = { value: 5 };
  let lastFrameTime = performance.now();
  
  const collisionCooldown = 600;
  const lastBounceTime = {
    paddle1: 0,
    paddle2: 0,
  };

  const collisionState = {
    paddle1: { value: false },
    paddle2: { value: false },
    
  };
  
  scene.onBeforeRenderObservable.add(() => {

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastFrameTime) / 1000;
    
    
    const moveVector = direction.clone().scale(speed.value * deltaTime);
    ball.position.addInPlace(moveVector);

    //collission to side walls. This is buggy, make it better 
    const xLimit = 3.6;
    if (ball.position.x > xLimit || ball.position.x < -xLimit) {
      direction.x *= -1;
    }

    //COLLISSION HANDLING
    checkAndHandlePaddleCollision(ball, paddle1, direction, collisionState.paddle1, 'paddle1', lastBounceTime, collisionCooldown, speed, false);
    checkAndHandlePaddleCollision(ball, paddle2, direction, collisionState.paddle2, 'paddle2', lastBounceTime, collisionCooldown, speed, true);


    // Scoring zone //score counting needs to be done it is still a mess
  const zLimit = 6;
  
  if (ball.position.z < -zLimit || ball.position.z > zLimit) {
    score(ball, topwall1, topwall2, angle, direction, speed, zLimit);
  }

    lastFrameTime = currentTime;
  });
}

