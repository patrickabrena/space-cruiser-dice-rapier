import * as THREE from "three";
import { getBody, getMouseBall } from "./getBodies-test.js";
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.11.2';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

let w = window.innerWidth;
let h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

let mousePos = new THREE.Vector2();
await RAPIER.init();
const gravity = { x: 0.0, y: 0, z: 0.0 };
const world = new RAPIER.World(gravity);

// Post-processing
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.5, 0.0, 0.005);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Create Bodies
const numBodies = 150;
const bodies = [];
for (let i = 0; i < numBodies; i++) {
  const body = getBody(RAPIER, world);
  bodies.push(body);
  scene.add(body.mesh);
}
const mouseBall = getMouseBall(RAPIER, world);
scene.add(mouseBall.mesh);

// Lighting
const hemiLight = new THREE.HemisphereLight(0x00bbff, 0xaa00ff, 10);
scene.add(hemiLight);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  world.step();
  mouseBall.update(mousePos);
  bodies.forEach(b => b.update());
  composer.render();
}
animate();

// Resize Handling (Fixes Aspect Ratio Issues)
function handleWindowResize() {
  w = window.innerWidth;
  h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(window.devicePixelRatio);
  composer.setSize(w, h);
}
window.addEventListener('resize', handleWindowResize, false);

// Mouse Controls
function handleMouseMove(evt) {
  mousePos.x = (evt.clientX / window.innerWidth) * 2 - 1;
  mousePos.y = -(evt.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', handleMouseMove, false);

// Touch Controls (Mobile Support)
function handleTouchMove(evt) {
  if (evt.touches.length > 0) {
    const touch = evt.touches[0];
    mousePos.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  }
}
window.addEventListener('touchmove', handleTouchMove, false);
