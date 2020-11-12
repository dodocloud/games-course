import * as THREE from 'three';
import { ThreeJSExample } from '../utils/APHExample';

const PARTICLES_NUM = 10000;

export class Sprites extends ThreeJSExample {

	camera: THREE.PerspectiveCamera;
	

    load() {
		let textureLoader = new THREE.TextureLoader();

		this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 0.1, 1000);
		this.camera.position.z = 1000;
	
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

    update() {
        // 7) Rotate all objects in the scene
	
		this.renderer.render(this.scene, this.camera);
    }
}