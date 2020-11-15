import * as ECS from '../../libs/pixi-ecs';
import * as PixiMatter from '../../libs/pixi-matter';
import * as Matter from 'matter-js';
import { ECSExample, getBaseUrl } from '../utils/APHExample';

export class MatterCradle extends ECSExample {

	load() {
		const binder = new PixiMatter.MatterBind();
		binder.init(this.engine.scene);

		// add bodies
		let cradle = (<any>(Matter.Composites)).newtonsCradle(280, 100, 5, 30, 200);
		Matter.World.add(binder.mWorld, cradle);
		Matter.Body.translate(cradle.bodies[0], { x: -180, y: -100 });

		cradle = (<any>(Matter.Composites)).newtonsCradle(280, 380, 7, 20, 140);
		Matter.World.add(binder.mWorld, cradle);
		Matter.Body.translate(cradle.bodies[0], { x: -140, y: -100 });
	}
}