import * as ECS from '../../libs/pixi-ecs';
import * as PixiMatter from '../../libs/pixi-matter';
import * as Matter from 'matter-js';
import { ECSExample, getBaseUrl } from '../utils/APHExample';

export class MatterAirFriction extends ECSExample {

	load() {
		const binder = new PixiMatter.MatterBind();
		binder.init(this.engine.scene);

		// add bodies
		Matter.World.add(binder.mWorld, [
			// falling blocks
			Matter.Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
			Matter.Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
			Matter.Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }),

			// walls
			Matter.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
			Matter.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
			Matter.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
			Matter.Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
		]);
	}
}