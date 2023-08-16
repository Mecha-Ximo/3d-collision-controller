import { Euler, Vector3 } from 'three';

interface MovementState {
  front: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
}

export class Movement {
  private state: MovementState = {
    front: false,
    back: false,
    left: false,
    right: false,
  };

  /**
   * Update the movement state.
   * @param newMovementState - the new state
   */
  public update(newMovementState: Partial<MovementState>): void {
    this.state = { ...this.state, ...newMovementState };
  }

  /**
   * Get the movement direction based on a base vector (usually the view direction)
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
   * @param baseVector - the vector to be used as a base
   * @returns the movement direction vector
   */
  public getMovementDirection(baseVector: Vector3): Vector3 {
    const baseDirection = baseVector.clone().normalize();
    baseDirection.y = 0;
    const movementDirection = new Vector3();

    if (this.state.front) {
      movementDirection.add(baseDirection);
    }

    if (this.state.back) {
      const backDirection = baseDirection.clone();
      backDirection.applyEuler(new Euler(0, Math.PI, 0));
      movementDirection.add(backDirection);
    }

    if (this.state.left) {
      const leftDirection = baseDirection.clone();
      leftDirection.applyEuler(new Euler(0, Math.PI / 2, 0));
      movementDirection.add(leftDirection);
    }

    if (this.state.right) {
      const rightDirection = baseDirection.clone();
      rightDirection.applyEuler(new Euler(0, -Math.PI / 2, 0));
      movementDirection.add(rightDirection);
    }

    return movementDirection;
  }
}
