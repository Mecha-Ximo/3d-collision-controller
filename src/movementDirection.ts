import { Euler, Vector3 } from 'three';
import { Direction } from './movements/direction';

export interface MovementState {
  front: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
}

export interface MovementRegistry {
  isMovingForward: boolean;
  isMovingBackward: boolean;
  isMovingLeft: boolean;
  isMovingRight: boolean;
}

/**
 *  Handles movement direction.
 * Will compute combinations of presses (i.e: Front + left === 45º left)
 *
 *      Z Axis
 *            ^ BASE DIRECTION === Front Movement (No Rotation needed)
 *            |    ^
 *   Left M   |   /  i.e: if front and right pressed this is the approx result
 * (Rotate    |  /
 *   Y 90º)   | /      Right M (Rotate Y -90º)
 *    <------(x)------->
 *          Y |        X Axis
 *       axis |
 *            | Backward Movement (Rotate Y -180º)
 *            |
 *
 */
export class MovementDirection {
  private readonly front = new Direction(new Euler(0, 0, 0));

  private readonly back = new Direction(new Euler(0, Math.PI, 0));

  private readonly left = new Direction(new Euler(0, Math.PI / 2, 0));

  private readonly right = new Direction(new Euler(0, -Math.PI / 2, 0));

  private readonly directions = [this.front, this.back, this.left, this.right] as const;

  public get movementRegistry(): MovementRegistry {
    return {
      isMovingBackward: this.back.isActive,
      isMovingForward: this.front.isActive,
      isMovingLeft: this.left.isActive,
      isMovingRight: this.right.isActive,
    };
  }

  public get isMoving(): boolean {
    return Object.values(this.movementRegistry).some((movement) => movement);
  }

  /**
   * Update the movement state.
   * @param newMovementState - the new state
   */
  public update(newMovementState: Partial<MovementState>): void {
    if (newMovementState.back !== undefined) {
      this.back.isActive = newMovementState.back;
    }

    if (newMovementState.front !== undefined) {
      this.front.isActive = newMovementState.front;
    }

    if (newMovementState.left !== undefined) {
      this.left.isActive = newMovementState.left;
    }

    if (newMovementState.right !== undefined) {
      this.right.isActive = newMovementState.right;
    }
  }

  /**
   * Get the movement direction based on a base vector (usually the view direction)
   * @param viewDirection - the vector to be used as a base
   * @returns the movement direction vector
   */
  public getDirection(viewDirection: Vector3): Vector3 {
    const baseDirection = viewDirection.clone().normalize();
    baseDirection.y = 0; // we don't consider 'y' plane so far (constantly moving in X-Z) when 3d movement implement it will matter

    return this.directions.reduce((movementDirection, dir) => {
      if (dir.isActive) {
        movementDirection.add(dir.apply(baseDirection));
      }

      return movementDirection.normalize();
    }, new Vector3());
  }
}
