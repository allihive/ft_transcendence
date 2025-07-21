import type { RefObject } from 'react';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

export function paddleMovement(
  paddle1Ref: RefObject<Mesh | null>,
  paddle2Ref: RefObject<Mesh | null>,
  basePaddleSpeed: number = 4 
) {
  const minX = -3.5;
  const maxX = 3.5;

  let paddle1X = 0;
  let paddle2X = 0;

  let currentPaddleSpeed = basePaddleSpeed;

  const keys = {
    paddle1Left: false,
    paddle1Right: false,
    paddle2Left: false,
    paddle2Right: false
  };

  // Set up global callback for ball speed increases
  (window as any).onBallSpeedIncrease = (ballSpeed: number) => {
    // Increase paddle speed proportionally to ball speed
    // When ball speed is 3, paddle speed is 4 (base)
    // When ball speed increases, paddle speed increases too
    currentPaddleSpeed = basePaddleSpeed + (ballSpeed - 3) * 0.8; // 0.8 multiplier for balance
  };

  const updatePaddleMovement = (deltaTime: number) => {

    if (keys.paddle1Left && !keys.paddle1Right) {
      paddle1X -= currentPaddleSpeed * deltaTime;
    }
    if (keys.paddle1Right && !keys.paddle1Left) {
      paddle1X += currentPaddleSpeed * deltaTime;
    }

    if (keys.paddle2Left && !keys.paddle2Right) {
      paddle2X -= currentPaddleSpeed * deltaTime;
    }
    if (keys.paddle2Right && !keys.paddle2Left) {
      paddle2X += currentPaddleSpeed * deltaTime;
    }

    // Clamp positions
    paddle1X = Math.max(minX, Math.min(maxX, paddle1X));
    paddle2X = Math.max(minX, Math.min(maxX, paddle2X));

    // Update mesh positions
    if (paddle1Ref.current) {
      paddle1Ref.current.position.x = paddle1X;
      paddle1Ref.current.position.z = 5;
    }

    if (paddle2Ref.current) {
      paddle2Ref.current.position.x = paddle2X;
      paddle2Ref.current.position.z = -5;
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();

    if (['a', 'd', 'arrowleft', 'arrowright'].includes(key)) {
      e.preventDefault();
    }
    
    switch (key) {
      case 'a':
        keys.paddle1Left = true;
        break;
      case 'd':
        keys.paddle1Right = true;
        break;
      case 'arrowleft':
        keys.paddle2Left = true;
        break;
      case 'arrowright':
        keys.paddle2Right = true;
        break;
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    
    switch (key) {
      case 'a':
        keys.paddle1Left = false;
        break;
      case 'd':
        keys.paddle1Right = false;
        break;
      case 'arrowleft':
        keys.paddle2Left = false;
        break;
      case 'arrowright':
        keys.paddle2Right = false;
        break;
    }
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Return the update function to be called from the main render loop
  return {
    update: updatePaddleMovement,
    cleanup: () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      // Clean up global callback
      delete (window as any).onBallSpeedIncrease;
    }
  };
}
