import { ArrowHelper, Group, Intersection, Raycaster, Scene, Vector3 } from 'three';
import { BaseController } from './baseController';

interface CollisionControllerConfig {
  highCollisionHeight: number;
  lowCollisionHeight: number;
}

// TODO: set debug mode through env variable

export class CollisionController {
  private readonly lowRaycaster: Raycaster;

  private readonly highRaycaster: Raycaster;

  private readonly debugGroup = new Group();

  constructor(
    private readonly baseController: BaseController,
    private config: CollisionControllerConfig,
    private readonly sceneGraph: Scene,
    private readonly debugMode = false
  ) {
    this.lowRaycaster = new Raycaster();
    this.highRaycaster = new Raycaster();

    if (this.debugMode) {
      this.sceneGraph.add(this.debugGroup);
    }

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

    // filter debug group
    const meshes = this.sceneGraph.children.filter((child) => child.uuid !== this.debugGroup.uuid);

    const intersections = raycaster.intersectObjects(meshes, true);
    if (this.debugMode) {
      this.addDebugArrow(direction, origin, 6, intersections.length ? 0x00ff00 : 0xff0000);
    }

    return intersections;
  }

  private addDebugArrow(direction: Vector3, origin: Vector3, distance: number, color: number): void {
    const arrow = new ArrowHelper(direction, origin, distance, color);

    this.debugGroup.add(arrow);
  }
}
