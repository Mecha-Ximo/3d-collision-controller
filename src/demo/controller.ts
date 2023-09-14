import { Camera, Scene } from 'three';
import { CollisionController } from '../controller/collisionController';

export function setUpController(
  camera: Camera,
  canvas: HTMLCanvasElement,
  sceneGraph: Scene
): void {
  const controller = new CollisionController(
    camera,
    canvas,
    {
      highCollisionHeight: 2,
      lowCollisionHeight: 0.2,
      collisionDistance: 1,
      cameraHeight: 1.5,
      movementDistance: 0.1,
    },
    sceneGraph,
    !!import.meta.env.VITE_DEBUG
  );

  /**
   * Request Pointer Lock.
   */
  window.addEventListener('click', () => {
    controller.enable();
  });

  /**
   * Set up movement, up to the consumer to config.
   */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'w') {
      controller.moveForward(true);
    }

    if (e.key === 's') {
      controller.moveBackward(true);
    }

    if (e.key === 'a') {
      controller.moveLeft(true);
    }

    if (e.key === 'd') {
      controller.moveRight(true);
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'w') {
      controller.moveForward(false);
    }

    if (e.key === 's') {
      controller.moveBackward(false);
    }

    if (e.key === 'a') {
      controller.moveLeft(false);
    }

    if (e.key === 'd') {
      controller.moveRight(false);
    }
  });
}
