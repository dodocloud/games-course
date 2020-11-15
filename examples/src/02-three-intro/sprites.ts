import * as THREE from 'three';
import { ThreeJSExample, getBaseUrl } from '../utils/APHExample';

const PARTICLES_NUM = 10000;

export class Sprites extends ThreeJSExample {

	camera: THREE.PerspectiveCamera;
	

    load() {
		let textureLoader = new THREE.TextureLoader();

		this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 0.1, 1000);
		this.camera.position.z = 1000;
	
		this.scene.fog = new THREE.FogExp2(0x000000, 0.001);


		let vertices = [];
		// generate random vertices
		for (let i = 0; i < PARTICLES_NUM; i++) {
			let x  = Math.random() * 2000 - 1000;
			let y  = Math.random() * 2000 - 1000;
			let z  = Math.random() * 2000 - 1000;

			vertices.push(x, y, z);
		}
	
		// Create a geometry
		let geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		
		// Load a texture from './assets/02-pixi-intro/ghost.png' and create a material
		let texture = textureLoader.load(`${getBaseUrl()}/assets/02-pixi-intro/ghost.png`);
		let material = new THREE.PointsMaterial({
			size: 20,
			map: texture,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		});

		// Add points to the scene
		let particles = new THREE.Points(geometry, material);
		this.scene.add(particles);
    }

    update() {
		// Rotate all objects in the scene
		const delta = this.clock.getElapsedTime() * 0.1;
		this.scene.children.filter(child => child instanceof THREE.Points).forEach((child => {
			child.rotation.y = delta;
		}));
		this.renderer.render(this.scene, this.camera);
    }
}