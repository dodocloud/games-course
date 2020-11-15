import * as ECS from '../../libs/pixi-ecs';
import * as PixiMatter from '../../libs/pixi-matter';
import * as Matter from 'matter-js';
import { ECSExample, getBaseUrl } from '../utils/APHExample';

export class MatterFriction extends ECSExample {

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

		Matter.World.add(binder.mWorld, [
			Matter.Bodies.rectangle(300, 180, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }),
			Matter.Bodies.rectangle(300, 70, 40, 40, { friction: 0.001 })
		]);

		Matter.World.add(binder.mWorld, [
			Matter.Bodies.rectangle(300, 350, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }),
			Matter.Bodies.rectangle(300, 250, 40, 40, { friction: 0.0005 })
		]);

		Matter.World.add(binder.mWorld, [
			Matter.Bodies.rectangle(300, 520, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }),
			Matter.Bodies.rectangle(300, 430, 40, 40, { friction: 0 })
		]);
	}
}