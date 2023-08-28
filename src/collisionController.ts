import { Camera, Object3D } from 'three';
import { BaseController, ControllerConfig, ControllerState } from './baseController';
import { CollisionDetector } from './collisionDetector';

// TODO: add config setter

interface CollisionControllerConfig extends ControllerConfig {
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
  private readonly baseController: BaseController;

  private readonly lowCollisionDetector: CollisionDetector;

  private readonly highCollisionDetector: CollisionDetector;

  constructor(
    camera: Camera,
    domElement: HTMLElement,
    config: CollisionControllerConfig,
    sceneGraph: Object3D,
    debugMode = false
  ) {
    this.baseController = new BaseController(camera, domElement, config);

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

    this.update();
  }

  public enable(): void {
    this.baseController.enable();
  }

  public moveForward(move: boolean): void {
    this.baseController.moveForward(move);
  }

  public moveBackward(move: boolean): void {
    this.baseController.moveBackward(move);
  }

  public moveLeft(move: boolean): void {
    this.baseController.moveLeft(move);
  }

  public moveRight(move: boolean): void {
    this.baseController.moveRight(move);
  }

  private checkCollisions(state: ControllerState): boolean {
    const lowCollision = this.lowCollisionDetector.checkCollision(state);
    const highCollision = this.highCollisionDetector.checkCollision(state);

    return highCollision || lowCollision;
  }

  private update(): void {
    if (
      this.baseController.controllerState.isMoving &&
      !this.checkCollisions(this.baseController.controllerState)
    ) {
      this.baseController.update();
    }

    requestAnimationFrame(() => this.update());
  }
}
