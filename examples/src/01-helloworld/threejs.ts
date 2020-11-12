import * as THREE from 'three';
import { ThreeJSExample, getBaseUrl } from '../utils/APHExample';

export class ThreeHelloWorld extends ThreeJSExample {

	camera: THREE.Camera;
	uniforms = {
		u_time: { type: "f", value: 1.0 },
		u_resolution: { type: "v2", value: new THREE.Vector2() },
		u_mouse: { type: "v2", value: new THREE.Vector2() }
	};
	loadFinished = false;

    load() {
		let vertexShader = null;
		let fragmentShader = null;

		fetch(new Request(`${getBaseUrl()}/assets/01-helloworld/example-3D.vert`))
			.then(response => response.text())
			.then(data => {
				vertexShader = data;
				fetch(new Request(`${getBaseUrl()}/assets/01-helloworld/example-3D.frag`))
				.then(response => response.text())
				.then(data => {
					fragmentShader = data;
					this.camera = new THREE.Camera();
					this.camera.position.z = 1;
				
					var geometry = new THREE.PlaneBufferGeometry(2, 2);
			
					var material = new THREE.ShaderMaterial({
						uniforms: this.uniforms,
						vertexShader: vertexShader,
						fragmentShader: fragmentShader
					});
				
					var mesh = new THREE.Mesh(geometry, material);
					this.scene.add(mesh);
				
					this.uniforms.u_resolution.value.x = this.renderer.domElement.width;
					this.uniforms.u_resolution.value.y = this.renderer.domElement.height;
					this.loadFinished = true;			
				})
			})				
    }

    update() {
		if(this.loadFinished) {
			this.uniforms.u_time.value += 0.05;
			this.renderer.render(this.scene, this.camera);
		}
    }
}
