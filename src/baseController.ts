import { Camera, Quaternion, Vector3 } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { MovementDirection } from './movement';

/**
 * TODO:
 * - inject PointerLock or create in ctor ?
 * - remove auto update option, it is mandatory
 * - refactor listeners to Map
 */

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

interface MovementRegistry {
  isMovingForward: boolean;
  isMovingBackward: boolean;
  isMovingLeft: boolean;
  isMovingRight: boolean;
}

export class BaseController {
  private readonly controller: PointerLockControls;

  private readonly movementRegistry: MovementRegistry = {
    isMovingBackward: false,
    isMovingForward: false,
    isMovingLeft: false,
    isMovingRight: false,
  };

  private readonly movement = new MovementDirection();

  constructor(camera: Camera, domElement: HTMLElement, private config: ControllerConfig) {
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
  public get controllerState(): ControllerState {
    const viewDirection = this.controller.camera.getWorldDirection(new Vector3()).clone();

    return {
      position: this.controller.camera.position.clone(),
      quaternion: this.controller.camera.quaternion.clone(),
      viewDirection,
      movementDirection: this.movement.get(viewDirection).clone().normalize(),
      isMoving: Object.values(this.movementRegistry).some((movement) => movement),
    };
  }

  /**
   * Update controller config fields.
   * @param update - the new config
   */
  public updateConfig(update: Partial<ControllerConfig>): void {
    this.config = { ...this.config, ...update };
  }

  public update(movementDistance = this.config.movementDistance): void {
    // normalize movement distance depending on keys pressed (solve the issue moving faster in diagonal)
    const amountOfMovement = Object.values(this.movementRegistry).reduce(
      (totalMovement: number, movement: boolean) => totalMovement + +movement,
      0
    );

    if (this.movementRegistry.isMovingForward) {
      this.controller.moveForward(movementDistance / amountOfMovement);
    }

    if (this.movementRegistry.isMovingBackward) {
      this.controller.moveForward(-movementDistance / amountOfMovement);
    }

    if (this.movementRegistry.isMovingLeft) {
      this.controller.moveRight(-movementDistance / amountOfMovement);
    }

    if (this.movementRegistry.isMovingRight) {
      this.controller.moveRight(movementDistance / amountOfMovement);
    }
  }

  public moveForward(move: boolean): void {
    this.movementRegistry.isMovingForward = move;
    this.movement.update({ front: move });
  }

  public moveBackward(move: boolean): void {
    this.movementRegistry.isMovingBackward = move;
    this.movement.update({ back: move });
  }

  public moveLeft(move: boolean): void {
    this.movementRegistry.isMovingLeft = move;
    this.movement.update({ left: move });
  }

  public moveRight(move: boolean): void {
    this.movementRegistry.isMovingRight = move;
    this.movement.update({ right: move });
  }
}
