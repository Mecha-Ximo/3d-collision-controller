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
import { setUpController } from './controller';

const canvas = document.getElementById('demo');

if (!checkDOMElement(canvas, 'canvas')) {
  throw new Error('Element is not a canvas');
}

const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 30);
camera.position.set(0, 0, 3);
camera.updateProjectionMatrix();

const sceneRoot = new Scene();
const cube = createCube(1, 4, 1, 0xddcc22, new Vector3(0, 0, 0), new Vector3(0, 0, Math.PI / 3));
const cube2 = createCube(1, 1, 1, 0x66cc22, new Vector3(3, 2, 0), new Vector3(0, 0, 0));
const cube3 = createCube(1, 1, 3, 0xdd2222, new Vector3(6, 0, 0), new Vector3(0, Math.PI / 3.2, 0));
const cube4 = createCube(2, 1, 1, 0xccccbb, new Vector3(3, 2, 3), new Vector3(0, 0, 0));
const cube5 = createCube(1, 1, 1, 0x11ccdd, new Vector3(3, 2, -3), new Vector3(Math.PI / 3, 0, 0));
const cube6 = createCube(
  1,
  1,
  1,
  0x11ccdd,
  new Vector3(3.01, 0, -3),
  new Vector3(Math.PI / 3, 0, 0)
);
sceneRoot.add(cube, cube2, cube3, cube4, cube5, cube6);

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

setUpController(camera, canvas, sceneRoot);

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
  position: Vector3,
  rotation: Vector3
): Mesh {
  const geometry = new BoxGeometry(width, height, depth);
  const material = new MeshBasicMaterial({ color });

  const mesh = new Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z);

  return mesh;
}
