import { Intersection, Object3D, Raycaster, Vector3 } from 'three';
import { ControllerState } from './baseController';
import { ControllerDebugger } from './debug/controllerDebugger';

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
    const position = controllerState.position.clone();
    const intersections = this.triggerRaycaster(position, controllerState.movementDirection);
    const minDistanceIntersection = this.getMinDistanceIntersection(intersections);

    return minDistanceIntersection;
  }

  private triggerRaycaster(position: Vector3, direction: Vector3): Intersection[] {
    const origin = position.clone();
    origin.y = this.config.height;
    this.raycaster.set(origin, direction.normalize());

    const meshesToIntersect =
      this.config.debugger?.filterDebuggerMeshes() ?? this.config.sceneGraph.children;
    const intersections = this.raycaster.intersectObjects(meshesToIntersect, true);
    const minDistanceIntersection = this.getMinDistanceIntersection(intersections);

    this.config.debugger?.addArrowHelper({
      direction,
      origin,
      length: this.config.collisionDistance * 4,
      color: minDistanceIntersection ? 0xff0000 : 0x00ff00,
    });

    if (minDistanceIntersection) {
      this.config.debugger?.addArrowHelper({
        direction: minDistanceIntersection.normal
          .clone()
          .transformDirection(minDistanceIntersection.object.matrix)
          .projectOnPlane(new Vector3(0, 1, 0)),
        origin: minDistanceIntersection.point,
        length: this.config.collisionDistance * 6,
        color: 0xffff00,
      });
    }

    return intersections;
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
