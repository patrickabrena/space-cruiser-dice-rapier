import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
let loadedModel = null;

// Load model once and store it
loader.load("d12.glb", (gltf) => {
    loadedModel = gltf.scene;

    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const texturePath = "space-cruiser-panels2-bl/";

    const albedoTexture = textureLoader.load(`${texturePath}space-cruiser-panels2_albedo.png`);
    const aoTexture = textureLoader.load(`${texturePath}space-cruiser-panels2_ao.png`);
    const metallicTexture = textureLoader.load(`${texturePath}space-cruiser-panels2_metallic.png`);
    const normalTexture = textureLoader.load(`${texturePath}space-cruiser-panels2_normal-ogl.png`);
    const roughnessTexture = textureLoader.load(`${texturePath}space-cruiser-panels2_roughness.png`);
    const displacementTexture = textureLoader.load(`${texturePath}space-cruiser-panels2_height.png`);

    // Set texture color space and flip Y-axis
    albedoTexture.colorSpace = THREE.SRGBColorSpace;
    aoTexture.colorSpace = THREE.SRGBColorSpace;
    metallicTexture.colorSpace = THREE.SRGBColorSpace;
    roughnessTexture.colorSpace = THREE.SRGBColorSpace;

    albedoTexture.flipY = true;
    aoTexture.flipY = true;
    metallicTexture.flipY = true;
    normalTexture.flipY = true;
    roughnessTexture.flipY = true;
    displacementTexture.flipY = true;

    // Set texture repetition
    const repeatValue = 8;
    albedoTexture.wrapS = albedoTexture.wrapT = THREE.RepeatWrapping;
    aoTexture.wrapS = aoTexture.wrapT = THREE.RepeatWrapping;
    metallicTexture.wrapS = metallicTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
    roughnessTexture.wrapS = roughnessTexture.wrapT = THREE.RepeatWrapping;
    displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;

    albedoTexture.repeat.set(repeatValue, repeatValue);
    aoTexture.repeat.set(repeatValue, repeatValue);
    normalTexture.repeat.set(repeatValue, repeatValue);
    roughnessTexture.repeat.set(repeatValue, repeatValue);
    metallicTexture.repeat.set(repeatValue, repeatValue);
    displacementTexture.repeat.set(repeatValue, repeatValue);

    // Create material
    const material = new THREE.MeshStandardMaterial({
        map: albedoTexture,
        aoMap: aoTexture,
        metalnessMap: metallicTexture,
        metalness: 0.99,
        roughness: 0.1,
        normalMap: normalTexture,
        roughnessMap: roughnessTexture,
        aoMapIntensity: .6,
        displacementMap: displacementTexture,
        displacementScale: 0,
        displacementBias: 0,
        color: new THREE.Color(0x0000ff),
        emissive: new THREE.Color(0x0000ff),
        emissiveIntensity: 0.02,
    });

    // Apply material to the model
    loadedModel.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
        }
    });
});

const sceneMiddle = new THREE.Vector3(0, 0, 0);

function getBody(RAPIER, world) {
    if (!loadedModel) return null; // Ensure model is loaded before creating bodies

    const size = 0.1 + Math.random() * 0.25;
    const range = 6;
    const density = size * 1.0;
    let x = Math.random() * range - range * 0.5;
    let y = Math.random() * range - range * 0.5 + 3;
    let z = Math.random() * range - range * 0.5;

    // Physics setup
    let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
    let rigid = world.createRigidBody(rigidBodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.ball(size).setDensity(density);
    world.createCollider(colliderDesc, rigid);

    // Clone model for this instance
    let modelInstance = loadedModel.clone();
    modelInstance.scale.set(size, size, size); // Adjust size
    modelInstance.position.set(x, y, z);

    function update() {
        rigid.resetForces(true);
        let { x, y, z } = rigid.translation();
        let pos = new THREE.Vector3(x, y, z);
        let dir = pos.clone().sub(sceneMiddle).normalize();
        rigid.addForce(dir.multiplyScalar(-0.7), true);
        modelInstance.position.set(x, y, z);
    }

    return { mesh: modelInstance, rigid, update };
}

function getMouseBall(RAPIER, world) {
    const mouseSize = 0.25;
    const geometry = new THREE.IcosahedronGeometry(mouseSize, 8);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
    });

    const mouseLight = new THREE.PointLight(0xffffff, 1);
    const mouseMesh = new THREE.Mesh(geometry, material);
    mouseMesh.add(mouseLight);

    // Rigid body
    let bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0, 0);
    let mouseRigid = world.createRigidBody(bodyDesc);
    let dynamicCollider = RAPIER.ColliderDesc.ball(mouseSize * 3.0);
    world.createCollider(dynamicCollider, mouseRigid);

    function update(mousePos) {
        mouseRigid.setTranslation({ x: mousePos.x * 5, y: mousePos.y * 5, z: 0.2 });
        let { x, y, z } = mouseRigid.translation();
        mouseMesh.position.set(x, y, z);
    }

    return { mesh: mouseMesh, update };
}

export { getBody, getMouseBall };
