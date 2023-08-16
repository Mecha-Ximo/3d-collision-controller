import { Euler, Vector3 } from 'three';

export class Direction {
  public isMoving = false;

  constructor(private readonly eulerRotation: Euler) {}

  public apply(baseDirection: Vector3): Vector3 {
    const direction = baseDirection.clone();
    direction.applyEuler(this.eulerRotation);

    return direction;
  }
}
