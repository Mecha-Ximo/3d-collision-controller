import { Camera, Object3D, Vector2, Vector3 } from 'three';
import { BaseController, ControllerConfig, ControllerState } from './baseController';
import { CollisionDetector, FaceIntersection } from './collisionDetector';
import { ControllerDebugger } from './debug/controllerDebugger';

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

  private readonly debugger: ControllerDebugger | null;

  constructor(
    camera: Camera,
    domElement: HTMLElement,
    config: CollisionControllerConfig,
    sceneGraph: Object3D,
    debugMode = false
  ) {
    this.baseController = new BaseController(camera, domElement, config);

    this.debugger = debugMode ? new ControllerDebugger(sceneGraph, 500) : null;

    this.lowCollisionDetector = new CollisionDetector({
      sceneGraph: sceneGraph,
      collisionDistance: config.collisionDistance,
      debugger: this.debugger,
      height: config.lowCollisionHeight,
    });

    this.highCollisionDetector = new CollisionDetector({
      sceneGraph: sceneGraph,
      collisionDistance: config.collisionDistance,
      debugger: this.debugger,
      height: config.highCollisionHeight,
    });

    this.update();
  }

  /**
   * {@inheritdoc BaseController.enable}
   */
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

  private getCloserCollision(state: ControllerState): FaceIntersection | null {
    const lowCollision = this.lowCollisionDetector.getCollision(state);
    const highCollision = this.highCollisionDetector.getCollision(state);

    const collisions = [highCollision, lowCollision].filter(
      (collision): collision is FaceIntersection => collision !== null
    );

    if (!collisions.length) {
      return null;
    }

    return collisions.sort(
      (collisionA, collisionB) => collisionA.distance + collisionB.distance
    )[0];
  }

  private update(): void {
    if (!this.baseController.state.isMoving) {
      requestAnimationFrame(() => this.update());
      return;
    }

    const collision = this.getCloserCollision(this.baseController.state);

    if (!collision) {
      this.baseController.updatePosition();
    }

    if (collision) {
      const slidingMovement = this.decomposeCollision(
        collision,
        this.baseController.state.movementDirection
      ).multiplyScalar(0.1); // scale to make movement slow

      this.baseController.moveCamera(slidingMovement);
    }

    requestAnimationFrame(() => this.update());
  }

  private decomposeCollision(intersection: FaceIntersection, direction: Vector3): Vector3 {
    const direction2D = new Vector2(direction.x, direction.z);
    const worldNormal = intersection.normal
      .clone()
      .transformDirection(intersection.object.matrix)
      .projectOnPlane(new Vector3(0, 1, 0)) // project on xz plane, plane where we move
      .normalize();

    const normal2D = new Vector2(worldNormal.x, worldNormal.z);

    const diff = new Vector2();
    diff.addVectors(direction2D, normal2D);

    return new Vector3(diff.x, 0, diff.y);
  }
}
