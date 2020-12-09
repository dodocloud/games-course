import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';

export class ShaderBasic extends ECSExample {

	load() {
		const geometry = new PIXI.Geometry().addAttribute('aVertexPosition', // the attribute name
			PIXI.Buffer.from([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]), 2) // vertex position, 2 coordinates for each
			.addAttribute('aTexturePosition', // the attribute name
				PIXI.Buffer.from([1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0]), 2) // u,v coordinates
			.addIndex([0, 1, 3, 0, 3, 2] as any) // create index over attribute coordinates -> we have 2 triangles
			.interleave(); // interleave attributes into one buffer (better for performance)

		let loader = this.engine.app.loader;
		loader
			.reset()
			.add('noise_vert', `${getBaseUrl()}/assets/07-graphics/shaders/basic.vert`)
			.add('noise_frag', `${getBaseUrl()}/assets/07-graphics/shaders/basic.frag`)
			.add('texture', `${getBaseUrl()}/assets/01-helloworld/crash.png`)
			.load(() => {
				const uniforms = {
					texture: new PIXI.Texture(PIXI.BaseTexture.from('texture')),
				};

				let vertexShader = loader.resources['noise_vert'].data;
				let fragmentShader = loader.resources['noise_frag'].data;

				new ECS.Builder(this.engine.scene)
					.asMesh(geometry, PIXI.Shader.from(vertexShader, fragmentShader, uniforms))
					.scale(0.5, 1)
					.withParent(this.engine.scene.stage)
					.build();
			});
	}
}