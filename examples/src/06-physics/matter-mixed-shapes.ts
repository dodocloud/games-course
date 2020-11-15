import * as ECS from '../../libs/pixi-ecs';
import * as PixiMatter from '../../libs/pixi-matter';
import * as Matter from 'matter-js';
import * as PixiMath from '../../libs/aph-math';
import { ECSExample, getBaseUrl } from '../utils/APHExample';

export class MatterMixedShapes extends ECSExample {

	load() {
		const binder = new PixiMatter.MatterBind();
		binder.init(this.engine.scene);

		const random = new PixiMath.Random(4000); 

		// add bodies
		let stack = Matter.Composites.stack(20, 20, 10, 5, 0, 0, (x, y) => {
			let sides = Math.round(random.uniform(1, 8));

			// triangles can be a little unstable, so avoid until fixed
			sides = (sides === 3) ? 4 : sides;

			// round the edges of some bodies
			let chamfer = null;
			if (sides > 2 && random.uniform() > 0.7) {
				chamfer = {
					radius: 10
				};
			}

			switch (Math.round(random.uniform(0, 1))) {
				case 0:
					if (random.uniform() < 0.8) {
						return Matter.Bodies.rectangle(x, y, random.uniform(25, 50), random.uniform(25, 50), { chamfer: chamfer });
					} else {
						return Matter.Bodies.rectangle(x, y, random.uniform(80, 120), random.uniform(25, 30), { chamfer: chamfer });
					}
				case 1:
					return Matter.Bodies.polygon(x, y, sides, random.uniform(25, 50), { chamfer: chamfer });
			}
		});

		Matter.World.add(binder.mWorld, stack);

		Matter.World.add(binder.mWorld, [
			// walls
			Matter.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
			Matter.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
			Matter.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
			Matter.Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
		]);
	}
}
