import * as ECS from '../../libs/pixi-ecs';
import * as PixiMatter from '../../libs/pixi-matter';
import * as Matter from 'matter-js';
import { ECSExample, getBaseUrl } from '../utils/APHExample';
import * as PixiMath from '../../libs/aph-math';


export class MatterBridge extends ECSExample {

	load() {
		const binder = new PixiMatter.MatterBind();
		binder.init(this.engine.scene);
		const random = new PixiMath.Random(4000);
		
		// add bodies
		let group = Matter.Body.nextGroup(true);

		let bridge = Matter.Composites.stack(160, 290, 15, 1, 0, 0, (x, y) => {
			return Matter.Bodies.rectangle(x - 20, y, 53, 20, {
				collisionFilter: <any>{ group: group },
				chamfer: <any>5,
				density: 0.005,
				frictionAir: 0.05,
				render: {
					fillStyle: '#575375'
				}
			});
		});

		Matter.Composites.chain(bridge, 0.3, 0, -0.3, 0, {
			stiffness: 1,
			length: 0,
			render: {
				visible: false
			}
		});

		let stack = Matter.Composites.stack(250, 50, 6, 3, 0, 0, (x, y) => {
			return Matter.Bodies.rectangle(x, y, 50, 50, <any>random.uniform(20, 40));
		});

		Matter.World.add(binder.mWorld, [
			bridge,
			stack,
			<any>Matter.Bodies.rectangle(30, 490, 220, 380, {
				isStatic: true,
				chamfer: { radius: 20 }
			}),
			Matter.Bodies.rectangle(770, 490, 220, 380, {
				isStatic: true,
				chamfer: { radius: 20 }
			}),
			Matter.Constraint.create({
				pointA: { x: 140, y: 300 },
				bodyB: bridge.bodies[0],
				pointB: { x: -25, y: 0 },
				length: 2,
				stiffness: 0.9
			}),
			Matter.Constraint.create({
				pointA: { x: 660, y: 300 },
				bodyB: bridge.bodies[bridge.bodies.length - 1],
				pointB: { x: 25, y: 0 },
				length: 2,
				stiffness: 0.9
			})
		]);
	}
}