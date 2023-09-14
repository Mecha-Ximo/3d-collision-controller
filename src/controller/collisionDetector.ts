import { Intersection, Object3D, Raycaster, Vector3 } from 'three';
import { ControllerDebugger } from '../debug/controllerDebugger';
import { ControllerState } from './baseController';

export interface CollisionDetectorConfig {
  sceneGraph: Object3D;
  height: number;
  collisionDistance: number;
  debugger: ControllerDebugger | null;
}

export interface FaceIntersection extends Intersection {
  normal: Vector3;
}

/**
 * Contains the logic to detect collisions.
 */
export class CollisionDetector {
  private readonly raycaster: Raycaster;

  constructor(private readonly config: CollisionDetectorConfig) {
    this.raycaster = new Raycaster();
  }

  /**
   * Check if a collision is happening for a given controller state.
   * @param controllerState - the controller state
   * @returns true if a collision is taking place
   */
  public getCollision(controllerState: ControllerState): FaceIntersection | null {
    const origin = controllerState.position.clone();
    const direction = controllerState.movementDirection.clone();
    origin.y = this.config.height;
    this.raycaster.set(origin, direction.normalize());

    const meshesToIntersect =
      this.config.debugger?.filterDebuggerMeshes() ?? this.config.sceneGraph.children;
    const intersections = this.raycaster.intersectObjects(meshesToIntersect, true);
    const collision = this.getMinDistanceIntersection(intersections);

    this.config.debugger?.addDebuggingArrows(direction, origin, collision);

    return collision;
  }

  private getMinDistanceIntersection(intersections: Intersection[]): FaceIntersection | null {
    // only interested in intersections with face (surfaces)
    const faceIntersections = intersections.filter(
      (intersection): intersection is FaceIntersection => intersection.normal !== undefined
    );

    if (!faceIntersections.length) {
      return null;
    }

    // careful with invariant: we rely on raycaster returning sorted intersections
    const minDistanceIntersection = faceIntersections[0];
    return minDistanceIntersection.distance < this.config.collisionDistance
      ? minDistanceIntersection
      : null;
  }
}
