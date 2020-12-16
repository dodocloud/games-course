import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';

export class Mandelbrot extends ECSExample {

	load() {
		const geometry = new PIXI.Geometry().addAttribute('aVertexPosition', // the attribute name
			PIXI.Buffer.from([
				-1.0, -1.0,
				1.0, -1.0,
				-1.0, 1.0,
				1.0, 1.0]), // x, y
			2) // the size of the attribute
			.addAttribute('aTexturePosition', // the attribute name
				PIXI.Buffer.from([
					-4.0, -4.0, 
					4.0, -4.0,
					-4.0, 4.0,
					4.0, 4.0]), // u, v
				2)
			.addIndex([0, 1, 3, 0, 3, 2] as any) // create index over attribute coordinates -> we have 2 triangles
			.interleave(); // interleave attributes into one buffer (better for performance)


		let loader = this.engine.app.loader;
		loader
			.reset()
			.add('mandelbrot_vert', `${getBaseUrl()}/assets/07-graphics/shaders/mandelbrot.vert`)
			.add('mandelbrot_frag', `${getBaseUrl()}/assets/07-graphics/shaders/mandelbrot.frag`)
			.add('palette', `${getBaseUrl()}/assets/07-graphics/shaders/mandelbrot_palette.png`)
			.load(() => {
				let vertexShader = loader.resources['mandelbrot_vert'].data;
				let fragmentShader = loader.resources['mandelbrot_frag'].data;

				const uniforms = {
					colorPalette: new PIXI.Texture(PIXI.BaseTexture.from('palette')),
					maxIteration: 256,
					projectionMatrix: PIXI.Matrix.IDENTITY,
				};

				const multiplier = 1.01;
				new ECS.Builder(this.engine.scene)
					.withName('quad')
					.asMesh(geometry, PIXI.Shader.from(vertexShader, fragmentShader, uniforms))
					.withComponent(new ECS.FuncComponent('updater').doOnUpdate((cmp, delta, absolute) => {
						cmp.owner.scale.set(cmp.owner.scale.x * multiplier);
						cmp.owner.position.x -= cmp.owner.scale.x * 0.001;
						cmp.owner.position.y -= cmp.owner.scale.y * 0.0006;
					}))
					.withParent(this.engine.scene.stage)
					.build();
			});
	}
}
