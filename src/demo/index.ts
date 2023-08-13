import {
  BoxGeometry,
  ColorRepresentation,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

const canvas = document.getElementById("demo");

if (!checkDOMElement(canvas, "canvas")) {
  throw new Error("Element is not a canvas");
}

const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 30);
camera.position.set(0, 0, 3);
camera.updateProjectionMatrix();

const sceneRoot = new Scene();
const cube = createCube(1, 1, 1, 0xddcc22);
sceneRoot.add(cube);

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.render(sceneRoot, camera);

window.addEventListener("resize", (e) => {
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

function createCube(width: number, height: number, depth: number, color: ColorRepresentation): Mesh {
  const geometry = new BoxGeometry(width, height, depth);
  const material = new MeshBasicMaterial({ color });

  return new Mesh(geometry, material);
}
