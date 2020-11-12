import * as THREE from 'three';
import { ThreeJSExample } from '../utils/APHExample';

export class Scene extends ThreeJSExample {

    camera: THREE.PerspectiveCamera;

    load() {
        this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 0.1, 1000);
                
        // add a cube
        let geometry = new THREE.BoxGeometry();
        let material = new THREE.MeshBasicMaterial({ color: 0xFF00FF });
        let cube = new THREE.Mesh(geometry, material);

        this.scene.add(cube);
        
        this.camera.position.z = 5;
    }

    update() {
        this.renderer.render(this.scene, this.camera);
    }
}