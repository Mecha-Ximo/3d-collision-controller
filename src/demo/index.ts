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
const cube2 = createCube(1, 1, 1, 0x66cc22, new Vector3(3, 2, 0));
const cube3 = createCube(1, 1, 1, 0xdd2222, new Vector3(6, 0, 0));
const cube4 = createCube(1, 1, 1, 0xccccbb, new Vector3(3, 2, 3));
const cube5 = createCube(1, 1, 1, 0x11ccdd, new Vector3(3, 2, -3));
sceneRoot.add(cube, cube2, cube3, cube4, cube5);

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const controller = new CollisionController(
  camera,
  canvas,
  {
    highCollisionHeight: 2,
    lowCollisionHeight: 0.2,
    collisionDistance: 1,
    cameraHeight: 1,
    movementDistance: 0.15,
  },
  sceneRoot,
  !!import.meta.env.VITE_DEBUG
);
window.addEventListener('click', () => {
  controller.enable();
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

function createCube(
  width: number,
  height: number,
  depth: number,
  color: ColorRepresentation,
  position: Vector3
): Mesh {
  const geometry = new BoxGeometry(width, height, depth);
  const material = new MeshBasicMaterial({ color });

  const mesh = new Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);

  return mesh;
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'w') {
    controller.moveForward(true);
  }

  if (e.key === 's') {
    controller.moveBackward(true);
  }

  if (e.key === 'a') {
    controller.moveLeft(true);
  }

  if (e.key === 'd') {
    controller.moveRight(true);
  }
});

window.addEventListener('keyup', (e) => {
  console.log('KEYUP', e.key);
  if (e.key === 'w') {
    controller.moveForward(false);
  }

  if (e.key === 's') {
    controller.moveBackward(false);
  }

  if (e.key === 'a') {
    controller.moveLeft(false);
  }

  if (e.key === 'd') {
    controller.moveRight(false);
  }
});
