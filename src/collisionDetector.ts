import { Intersection, Object3D, Raycaster, Vector3 } from 'three';
import { ControllerState } from './baseController';
import { ControllerDebugger } from './debug/controllerDebugger';

export interface CollisionDetectorConfig {
  sceneGraph: Object3D;
  height: number;
  collisionDistance: number;
  debugMode: boolean;
}

/**
 * Contains the logic to detect collisions.
 */
export class CollisionDetector {
  private readonly raycaster: Raycaster;

  private readonly debugger: ControllerDebugger | null;

  constructor(private readonly config: CollisionDetectorConfig) {
    this.raycaster = new Raycaster();
    this.debugger = config.debugMode ? new ControllerDebugger(config.sceneGraph, 500) : null;
  }

  /**
   * Check if a collision is happening for a given controller state.
   * @param controllerState - the controller state
   * @returns true if a collision is taking place
   */
  public checkCollision(controllerState: ControllerState): boolean {
    const position = controllerState.position.clone();
    const intersections = this.triggerRaycaster(position, controllerState.movementDirection);
    const minDistanceIntersection = this.getMinDistanceIntersection(intersections);

    return !!minDistanceIntersection;
  }

  private triggerRaycaster(position: Vector3, direction: Vector3): Intersection[] {
    const origin = position.clone();
    origin.y = this.config.height;
    this.raycaster.set(origin, direction.normalize());

    const meshesToIntersect =
      this.debugger?.filterDebuggerMeshes() ?? this.config.sceneGraph.children;
    const intersections = this.raycaster.intersectObjects(meshesToIntersect, true);
    const minDistanceIntersection = this.getMinDistanceIntersection(intersections);

    this.debugger?.addArrowHelper({
      direction,
      origin,
      length: this.config.collisionDistance * 4,
      color: minDistanceIntersection ? 0xff0000 : 0x00ff00,
    });

    return intersections;
  }

  private getMinDistanceIntersection(intersections: Intersection[]): Intersection | null {
    if (!intersections.length) {
      return null;
    }
    // careful with invariant: we rely on raycaster returning sorted intersections
    const minDistanceIntersection = intersections[0];
    return minDistanceIntersection.distance < this.config.collisionDistance
      ? minDistanceIntersection
      : null;
  }
}
