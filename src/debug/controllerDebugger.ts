import { ArrowHelper, ColorRepresentation, Group, Object3D, Vector3 } from 'three';

export interface ArrowConfiguration {
  direction: Vector3;
  origin: Vector3;
  length: number;
  color: ColorRepresentation;
}

export class ControllerDebugger {
  private readonly debugGroup = new Group();

  private readonly arrows: ArrowHelper[] = [];

  constructor(private readonly sceneNode: Object3D, private readonly maxArrows = 100) {
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
