import * as ECS from '../../libs/pixi-ecs';
import * as PixiMatter from '../../libs/pixi-matter';
import * as Matter from 'matter-js';
import { ECSExample, getBaseUrl } from '../utils/APHExample';

export class MatterCar extends ECSExample {

	load() {
		const binder = new PixiMatter.MatterBind();
		binder.init(this.engine.scene);

		// add bodies
		Matter.World.add(binder.mWorld, [
			// walls
			Matter.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
			Matter.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
			Matter.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
			Matter.Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
		]);

		let scale = 0.9;
		Matter.World.add(binder.mWorld, Matter.Composites.car(150, 100, 150 * scale, 30 * scale, 30 * scale));

		scale = 0.8;
		Matter.World.add(binder.mWorld, Matter.Composites.car(350, 300, 150 * scale, 30 * scale, 30 * scale));

		Matter.World.add(binder.mWorld, [
			Matter.Bodies.rectangle(200, 150, 400, 20, { isStatic: true, angle: Math.PI * 0.06 }),
			Matter.Bodies.rectangle(500, 350, 650, 20, { isStatic: true, angle: -Math.PI * 0.06 }),
			Matter.Bodies.rectangle(300, 560, 600, 20, { isStatic: true, angle: Math.PI * 0.04 })
		]);
	}
}