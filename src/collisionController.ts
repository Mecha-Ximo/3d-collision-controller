import { Intersection, Raycaster, Scene, Vector3 } from 'three';
import { BaseController } from './baseController';
import { ControllerDebugger } from './debug/controllerDebugger';

interface CollisionControllerConfig {
  /**
   * Position of high raycaster.
   */
  highCollisionHeight: number;
  /**
   * Position of low raycaster.
   */
  lowCollisionHeight: number;
  /**
   * The distance to trigger a collision.
   */
  collisionDistance: number;
}

export class CollisionController {
  private readonly lowRaycaster: Raycaster;

  private readonly highRaycaster: Raycaster;

  private readonly debugger: ControllerDebugger | null;

  constructor(
    private readonly baseController: BaseController,
    private config: CollisionControllerConfig,
    private readonly sceneGraph: Scene,
    debugMode = false
  ) {
    this.lowRaycaster = new Raycaster();
    this.highRaycaster = new Raycaster();
    this.debugger = debugMode ? new ControllerDebugger(sceneGraph, 50) : null;

    this.baseController.addEventListener('keydown', (state) => {
      const clonePos = state.position.clone();

      const lowIntersections = this.triggerRaycaster(
        this.lowRaycaster,
        this.config.lowCollisionHeight,
        clonePos,
        state.movementDirection
      );
      const highIntersections = this.triggerRaycaster(
        this.highRaycaster,
        this.config.highCollisionHeight,
        clonePos,
        state.movementDirection
      );

      console.log(lowIntersections);
    });
  }

  public enable(): void {
    this.baseController.enable();
  }

  public triggerRaycaster(
    raycaster: Raycaster,
    shotHeight: number,
    position: Vector3,
    direction: Vector3
  ): Intersection[] {
    const origin = position.clone();
    origin.y = shotHeight;
    raycaster.set(origin, direction.normalize());

    const meshesToIntersect = this.debugger?.filterDebuggerMeshes() ?? this.sceneGraph.children;
    const intersections = raycaster.intersectObjects(meshesToIntersect, true);
    const minDistanceIntersection = this.getMinDistanceIntersection(intersections);

    this.debugger?.addArrowHelper({
      direction,
      origin,
      length: 4,
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
    return minDistanceIntersection.distance < this.config.collisionDistance ? minDistanceIntersection : null;
  }
}
