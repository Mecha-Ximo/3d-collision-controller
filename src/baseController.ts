import { Quaternion, Vector3 } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { MovementDirection } from './movement';

/**
 * TODO:
 * - inject PointerLock or create in ctor ?
 * - remove auto update option, it is mandatory
 * - refactor listeners to Map
 */

export interface ControllerState {
  movementDirection: Vector3;
  viewDirection: Vector3;
  position: Vector3;
  quaternion: Quaternion;
}

interface MovementKeys {
  forward: string;
  backward: string;
  left: string;
  right: string;
}

interface ControllerConfig {
  cameraHeight: number;
  movementDistance: number;
  movementKeys: MovementKeys;
}

interface MovementRegistry {
  isMovingForward: boolean;
  isMovingBackward: boolean;
  isMovingLeft: boolean;
  isMovingRight: boolean;
}

export class BaseController {
  private readonly movementRegistry: MovementRegistry = {
    isMovingBackward: false,
    isMovingForward: false,
    isMovingLeft: false,
    isMovingRight: false,
  };

  private animationFrameId: number | null = null;

  private readonly eventListeners: ((e: ControllerState) => void)[] = [];

  private readonly movement = new MovementDirection();

  constructor(private readonly pointerLockControls: PointerLockControls, private config: ControllerConfig) {
    this.pointerLockControls.addEventListener('unlock', () => this.disable());
    this.pointerLockControls.camera.position.y = this.config.cameraHeight;
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
    this.pointerLockControls.lock();
    this.listenMovementKeys();
    this.autoUpdate();
  }

  /**
   * Disables the use of the controller.
   */
  public disable(): void {
    this.pointerLockControls.unlock();
    this.stopListeningMovementKeys();
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Retrieves the controller state.
   */
  public get controllerState(): ControllerState {
    const viewDirection = this.pointerLockControls.camera.getWorldDirection(new Vector3()).clone();

    return {
      position: this.pointerLockControls.camera.position.clone(),
      quaternion: this.pointerLockControls.camera.quaternion.clone(),
      viewDirection,
      movementDirection: this.movement.get(viewDirection).clone().normalize(),
    };
  }

  /**
   * Update controller config fields.
   * @param update - the new config
   */
  public updateConfig(update: Partial<ControllerConfig>): void {
    this.config = { ...this.config, ...update };
  }

  public addEventListener(_event: 'keydown', listener: (e: ControllerState) => void): void {
    this.eventListeners.push(listener);
  }

  private listenMovementKeys(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private stopListeningMovementKeys(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private autoUpdate(): void {
    this.update();
    this.animationFrameId = requestAnimationFrame(() => this.autoUpdate());
  }

  private update(): void {
    // normalize movement distance depending on keys pressed (solve the issue moving faster in diagonal)
    const keysPressed =
      +this.movementRegistry.isMovingBackward +
      +this.movementRegistry.isMovingForward +
      +this.movementRegistry.isMovingLeft +
      +this.movementRegistry.isMovingRight;

    if (this.movementRegistry.isMovingForward) {
      this.pointerLockControls.moveForward(this.config.movementDistance / keysPressed);
    }

    if (this.movementRegistry.isMovingBackward) {
      this.pointerLockControls.moveForward(-this.config.movementDistance / keysPressed);
    }

    if (this.movementRegistry.isMovingLeft) {
      this.pointerLockControls.moveRight(-this.config.movementDistance / keysPressed);
    }

    if (this.movementRegistry.isMovingRight) {
      this.pointerLockControls.moveRight(this.config.movementDistance / keysPressed);
    }
  }

  private readonly onKeyDown = (e: KeyboardEvent) => this.registerKeyPress(e);

  private readonly onKeyUp = (e: KeyboardEvent) => this.unregisterKeyPress(e);

  private unregisterKeyPress(e: KeyboardEvent): void {
    if (e.key === this.config.movementKeys.forward) {
      this.movementRegistry.isMovingForward = false;
      this.movement.update({ front: false });
    } else if (e.key === this.config.movementKeys.backward) {
      this.movementRegistry.isMovingBackward = false;
      this.movement.update({ back: false });
    } else if (e.key === this.config.movementKeys.left) {
      this.movementRegistry.isMovingLeft = false;
      this.movement.update({ left: false });
    } else if (e.key === this.config.movementKeys.right) {
      this.movementRegistry.isMovingRight = false;
      this.movement.update({ right: false });
    }
  }

  /**
   * REFACTOR
   */
  private registerKeyPress(e: KeyboardEvent): void {
    if (e.key === this.config.movementKeys.forward) {
      this.movementRegistry.isMovingForward = true;
      this.movement.update({ front: true });
    } else if (e.key === this.config.movementKeys.backward) {
      this.movementRegistry.isMovingBackward = true;
      this.movement.update({ back: true });
    } else if (e.key === this.config.movementKeys.left) {
      this.movementRegistry.isMovingLeft = true;
      this.movement.update({ left: true });
    } else if (e.key === this.config.movementKeys.right) {
      this.movementRegistry.isMovingRight = true;
      this.movement.update({ right: true });
    }

    this.eventListeners.forEach((listener) => listener(this.controllerState));
  }
}
