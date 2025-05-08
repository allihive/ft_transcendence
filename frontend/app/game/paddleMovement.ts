import { RefObject } from 'react';
import { Mesh } from 'babylonjs';

export function paddleMovement(
  redRef: RefObject<Mesh | null>,
  blackRef: RefObject<Mesh | null>,
  paddleSpeed: number
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
      paddleRef.current.position.z = fixedZ; // lock z
    }

    return clamped;
  };

  const move = () => {
    // Red paddle (top)
    if (pressedKeys.has('a')) {
      redX = movePaddle(redRef, redX, -1, 5); // move left
    }
    if (pressedKeys.has('q')) {
      redX = movePaddle(redRef, redX, 1, 5); // move right
    }

    // Black paddle (bottom)
    if (pressedKeys.has('l')) {
      blackX = movePaddle(blackRef, blackX, -1, -5); // move left
    }
    if (pressedKeys.has('p')) {
      blackX = movePaddle(blackRef, blackX, 1, -5); // move right
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
