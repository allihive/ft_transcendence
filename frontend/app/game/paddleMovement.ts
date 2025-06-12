import type { RefObject } from 'react';
import { Mesh } from '@babylonjs/core/Meshes/mesh';



export function paddleMovement(
  paddle1Ref: RefObject<Mesh | null>,
  paddle2Ref: RefObject<Mesh | null>,
  paddleSpeed: number = 0.07
) {
  const minX = -3.5;
  const maxX = 3.5;

  let redX = 0;
  let blackX = 0;

  const pressedKeys = new Set<string>();

  const movePaddle = (
    paddleRef: RefObject<Mesh | null>,
    position: number,
    direction: number,
    fixedZ: number
  ): number => {
    const newPos = position + paddleSpeed * direction;
    const clamped = Math.max(minX, Math.min(maxX, newPos));

    if (paddleRef.current) {
      paddleRef.current.position.x = clamped;
      paddleRef.current.position.z = fixedZ;
    }

    return clamped;
  };

  const move = () => {
    // Paddle 1
    if (pressedKeys.has('a')) {
      redX = movePaddle(paddle1Ref, redX, -1, 5); // move left
    }
    if (pressedKeys.has('q')) {
      redX = movePaddle(paddle1Ref, redX, 1, 5); // move right
    }

    // Paddle 2
    if (pressedKeys.has('l')) {
      blackX = movePaddle(paddle2Ref, blackX, -1, -5); // move left
    }
    if (pressedKeys.has('p')) {
      blackX = movePaddle(paddle2Ref, blackX, 1, -5); // move right
    }

    requestAnimationFrame(move);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    pressedKeys.add(e.key.toLowerCase());
  };

  const onKeyUp = (e: KeyboardEvent) => {
    pressedKeys.delete(e.key.toLowerCase());
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  requestAnimationFrame(move);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  };
}
