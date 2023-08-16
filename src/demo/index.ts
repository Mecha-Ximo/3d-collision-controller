import {
  BoxGeometry,
  ColorRepresentation,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { BaseController } from '../baseController';
import { CollisionController } from '../collisionController';

const canvas = document.getElementById('demo');

if (!checkDOMElement(canvas, 'canvas')) {
  throw new Error('Element is not a canvas');
}

const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 30);
camera.position.set(0, 0, 3);
camera.updateProjectionMatrix();

const sceneRoot = new Scene();
const cube = createCube(1, 1, 1, 0xddcc22, new Vector3(0, 0, 0));
const cube2 = createCube(1, 1, 1, 0xddcc22, new Vector3(3, 2, 0));
sceneRoot.add(cube);
sceneRoot.add(cube2);

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const pointerController = new PointerLockControls(camera, canvas);
const baseController = new BaseController(pointerController, {
  cameraHeight: 1,
  movementDistance: 0.15,
  movementKeys: { forward: 'w', backward: 's', left: 'a', right: 'd' },
});
const controller = new CollisionController(
  baseController,
  { highCollisionHeight: 2, lowCollisionHeight: 0.2 },
  sceneRoot,
  true
);
window.addEventListener('click', (e) => {
  // controller.connect();

  controller.enable();
  // controller.disable();
});

function render(): void {
  renderer.render(sceneRoot, camera);
  window.requestAnimationFrame(render);
}

render();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

/**
 * TODO: create util library
 */
function checkDOMElement<T extends keyof HTMLElementTagNameMap>(
  element: unknown,
  expectedNodeType: T
): element is HTMLElementTagNameMap[T] {
  return element instanceof HTMLElement && element.tagName.toLowerCase() === expectedNodeType;
}

function createCube(width: number, height: number, depth: number, color: ColorRepresentation, position: Vector3): Mesh {
  const geometry = new BoxGeometry(width, height, depth);
  const material = new MeshBasicMaterial({ color });

  const mesh = new Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);

  return mesh;
}
