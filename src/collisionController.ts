import { Object3D } from 'three';
import { BaseController } from './baseController';
import { CollisionDetector } from './collisionDetector';

// TODO: add config setter

interface CollisionControllerConfig {
  /**
   * Position of high raycaster.
   */
  highCollisionHeight: number;
  /**
   * Position of low raycaster.
   */
  lowCollisionHeight: number;
  /**
   * The distance to trigger a collision.
   */
  collisionDistance: number;
}

export class CollisionController {
  private readonly lowCollisionDetector: CollisionDetector;

  private readonly highCollisionDetector: CollisionDetector;

  constructor(
    private readonly baseController: BaseController,
    config: CollisionControllerConfig,
    sceneGraph: Object3D,
    debugMode = false
  ) {
    this.lowCollisionDetector = new CollisionDetector({
      sceneGraph: sceneGraph,
      collisionDistance: config.collisionDistance,
      debugMode,
      height: config.lowCollisionHeight,
    });

    this.highCollisionDetector = new CollisionDetector({
      sceneGraph: sceneGraph,
      collisionDistance: config.collisionDistance,
      debugMode,
      height: config.highCollisionHeight,
    });

    // TODO: refactor
    this.baseController.addEventListener('keydown', (state) => {
      const lowCollision = this.lowCollisionDetector.checkCollision(state);
      const highCollision = this.highCollisionDetector.checkCollision(state);

      console.log(highCollision, lowCollision);
    });
  }

  public enable(): void {
    this.baseController.enable();
  }
}
