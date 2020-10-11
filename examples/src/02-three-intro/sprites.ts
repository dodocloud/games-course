import * as THREE from 'three';

const PARTICLES_NUM = 10000;

let canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

// init renderer
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let textureLoader = new THREE.TextureLoader();
let renderer = new THREE.WebGLRenderer({ canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.width, canvas.height);

// init clock for measuring time
const clock = new THREE.Clock();
clock.start();

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
	camera.position.z = 1000;

	// 1) create a scene with a fading effect

	let vertices = [];
	// 2) generate random vertices
	for (let i = 0; i < PARTICLES_NUM; i++) {

	}

	// 3) Create a geometry

	// 4) Load a texture from './assets/02-pixi-intro/ghost.png' and create a material

	// 5) Create points from the geometry and materials you have declared and set a random rotation

	// 6) Add points to the scene
}


function animate() {
	requestAnimationFrame(animate);
	render();
}


function render() {
	// 7) Rotate all objects in the scene
	
	renderer.render(scene, camera);
}