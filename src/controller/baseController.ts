import { Camera, Quaternion, Vector3 } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { MovementDirection } from './movements/movementDirection';

export interface ControllerState {
  isMoving: boolean;
  movementDirection: Vector3;
  viewDirection: Vector3;
  position: Vector3;
  quaternion: Quaternion;
}

export interface ControllerConfig {
  cameraHeight: number;
  movementDistance: number;
}

export class BaseController {
  private readonly controller: PointerLockControls;

  private readonly movementDirection: MovementDirection;

  constructor(camera: Camera, domElement: HTMLElement, private config: ControllerConfig) {
    this.movementDirection = new MovementDirection();
    this.controller = new PointerLockControls(camera, domElement);
    this.controller.addEventListener('unlock', () => this.disable());
    this.controller.camera.position.y = this.config.cameraHeight;
  }

  /**
   * Enables the use of the controller.
   * It has to be authorized by user so it is necessary to be wrapped in user event.
   *
   * ```TS
   * // Example:
   * window.addEventListener('click', () => controller.enable())
   * ```
   */
  public enable(): void {
    this.controller.lock();
  }

  /**
   * Disables the use of the controller.
   */
  public disable(): void {
    this.controller.unlock();
  }

  /**
   * Retrieves the controller state.
   */
  public get state(): ControllerState {
    const viewDirection = this.controller.camera.getWorldDirection(new Vector3()).clone();

    return {
      position: this.controller.camera.position.clone(),
      quaternion: this.controller.camera.quaternion.clone(),
      viewDirection,
      movementDirection: this.movementDirection.getDirection(viewDirection),
      isMoving: this.movementDirection.isMoving,
    };
  }

  /**
   * Update controller config fields.
   * @param update - the new config
   */
  public updateConfig(update: Partial<ControllerConfig>): void {
    this.config = { ...this.config, ...update };
  }

  /**
   * Updates the controller position.
   * @param movementDistance - the distance to move.
   */
  public updatePosition(movementDistance = this.config.movementDistance): void {
    // normalize movement distance depending on keys pressed (solve the issue moving faster in diagonal)
    const amountOfMovement = Object.values(this.movementDirection.movementRegistry).reduce(
      (totalMovement: number, movement: boolean) => totalMovement + +movement,
      0
    );

    const movement = movementDistance / amountOfMovement;

    if (this.movementDirection.movementRegistry.isMovingForward) {
      this.controller.moveForward(movement);
    }

    if (this.movementDirection.movementRegistry.isMovingBackward) {
      this.controller.moveForward(-movement);
    }

    if (this.movementDirection.movementRegistry.isMovingLeft) {
      this.controller.moveRight(-movement);
    }

    if (this.movementDirection.movementRegistry.isMovingRight) {
      this.controller.moveRight(movement);
    }
  }

  /**
   * Moves the controller camera a certain displacement.
   * @param displacement - the movement to be applied
   */
  public moveCamera(displacement: Vector3): void {
    this.controller.camera.position.x += displacement.x;
    this.controller.camera.position.y += displacement.y;
    this.controller.camera.position.z += displacement.z;
  }

  public moveForward(move: boolean): void {
    this.movementDirection.update({ front: move });
  }

  public moveBackward(move: boolean): void {
    this.movementDirection.update({ back: move });
  }

  public moveLeft(move: boolean): void {
    this.movementDirection.update({ left: move });
  }

  public moveRight(move: boolean): void {
    this.movementDirection.update({ right: move });
  }
}
