import { ArrowHelper, ColorRepresentation, Group, Object3D, Scene, Vector3 } from 'three';
import { FaceIntersection } from '../controller/collisionDetector';

export interface ArrowConfiguration {
  direction: Vector3;
  origin: Vector3;
  length: number;
  color: ColorRepresentation;
}

/**
 * Instantiate to add debugging features to the controller.
 */
export class ControllerDebugger {
  private readonly debugGroup = new Group();

  private readonly arrows: ArrowHelper[] = [];

  constructor(private readonly sceneNode: Scene, private readonly maxArrows = 100) {
    sceneNode.add(this.debugGroup);
  }

  /**
   * Remove debugging group containing meshes to avoid being detected by raycaster.
   * @returns the list of children without debugging group
   */
  public filterDebuggerMeshes(): Object3D[] {
    return this.sceneNode.children.filter((child) => child.uuid !== this.debugGroup.uuid);
  }

  /**
   * Add a new arrow helper, if the amount of arrows exceed limit set old ones will be removed.
   * @param arrowConfig - the arrow configuration
   */
  public addArrowHelper(arrowConfig: ArrowConfiguration): void {
    const arrow = new ArrowHelper(
      arrowConfig.direction,
      arrowConfig.origin,
      arrowConfig.length,
      arrowConfig.color
    );
    this.debugGroup.add(arrow);
    this.arrows.push(arrow);

    if (this.arrows.length >= this.maxArrows) {
      this.removeFirstArrow();
    }
  }

  public addDebuggingArrows(
    direction: Vector3,
    origin: Vector3,
    collision: FaceIntersection | null
  ): void {
    this.addArrowHelper({
      direction,
      origin,
      length: 3,
      color: collision ? 0xff0000 : 0x00ff00,
    });

    if (collision) {
      this.addArrowHelper({
        direction: collision.normal
          .clone()
          .transformDirection(collision.object.matrix) // apply object transformation matrix to normal vector, otherwise it is computed on world
          .projectOnPlane(new Vector3(0, 1, 0)), // project on X-Z plane (when 3d collision detection remove)
        origin: collision.point,
        length: 3,
        color: 0xffff00,
      });
    }
  }

  /**
   * Clean up resources associated to the debugger.
   * - Remove debugging group
   * - Dispose arrow helper meshes
   */
  public destroy(): void {
    this.sceneNode.remove(this.debugGroup);
    this.debugGroup.children
      .filter((child): child is ArrowHelper => child instanceof ArrowHelper)
      .forEach((arrow) => {
        arrow.dispose();
      });
  }

  private removeFirstArrow(): void {
    const arrowToRemove = this.arrows.shift();
    if (arrowToRemove) {
      arrowToRemove.dispose();
      this.debugGroup.remove(arrowToRemove);
    }
  }
}
