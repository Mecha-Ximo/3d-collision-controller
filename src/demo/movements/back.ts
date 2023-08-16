import { Euler, Vector3 } from 'three';

// TODO: consider if it is worth it to have movement classes
export class Back {
  private readonly eulerRotation = new Euler(0, Math.PI, 0);

  public apply(baseDirection: Vector3): Vector3 {
    const direction = baseDirection.clone();
    direction.applyEuler(this.eulerRotation);

    return direction;
  }
}
