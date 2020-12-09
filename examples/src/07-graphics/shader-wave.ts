import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';

export class ShaderWave extends ECSExample {

	load() {
		const geometry = new PIXI.Geometry().addAttribute('aVertexPosition', // the attribute name
			PIXI.Buffer.from([
				-1.0, -1.0,
				1.0, -1.0,
				-1.0, 1.0,
				-1.0, 1.0,
				1.0, -1.0,
				1.0, 1.0]), // x, y
			2) // the size of the attribute
			.addAttribute('aTexturePosition', // the attribute name
				PIXI.Buffer.from([
					-1.0, -1.0,
					1.0, -1.0,
					-1.0, 1.0,
					-1.0, 1.0,
					1.0, -1.0,
					1.0, 1.0]), // u, v
				2); // the size of the attribute

		const uniforms = {
			u_resolution: [this.engine.app.screen.width, this.engine.app.screen.height],
			u_time: 0,
		};

		let loader = this.engine.app.loader;
		loader
			.reset()
			.add('noise_vert', `${getBaseUrl()}/assets/07-graphics/shaders/wave.vert`)
			.add('noise_frag', `${getBaseUrl()}/assets/07-graphics/shaders/wave.frag`)
			.load(() => {
				let vertexShader = loader.resources['noise_vert'].data;
				let fragmentShader = loader.resources['noise_frag'].data;

				new ECS.Builder(this.engine.scene)
					.asMesh(geometry, PIXI.Shader.from(vertexShader, fragmentShader, uniforms))
					.withComponent(new ECS.FuncComponent('updater').doOnUpdate((cmp, delta, absolute) => cmp.owner.asMesh().shader.uniforms.u_time += 0.1))
					.withParent(this.engine.scene.stage)
					.build();
			});
	}
}