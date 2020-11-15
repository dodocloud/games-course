import * as ECS from '../../libs/pixi-ecs';
import * as PixiMatter from '../../libs/pixi-matter';
import * as Matter from 'matter-js';
import { ECSExample, getBaseUrl } from '../utils/APHExample';


export class MatterChains extends ECSExample {

	load() {
		const binder = new PixiMatter.MatterBind();
		binder.init(this.engine.scene);

		// add bodies
		let group = Matter.Body.nextGroup(true);

		let ropeA = Matter.Composites.stack(100, 50, 8, 1, 10, 10, (x, y) => {
			return Matter.Bodies.rectangle(x, y, 50, 20, <any>{ collisionFilter: { group: group } });
		});

		Matter.Composites.chain(ropeA, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2, render: { type: 'line' } });
		Matter.Composite.add(ropeA, Matter.Constraint.create({
			bodyB: ropeA.bodies[0],
			pointB: { x: -25, y: 0 },
			pointA: { x: ropeA.bodies[0].position.x, y: ropeA.bodies[0].position.y },
			stiffness: 0.5
		}));

		group = Matter.Body.nextGroup(true);

		let ropeB = Matter.Composites.stack(350, 50, 10, 1, 10, 10, (x, y) => {
			return Matter.Bodies.circle(x, y, 20, <any>{ collisionFilter: { group: group } });
		});

		Matter.Composites.chain(ropeB, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2, render: { type: 'line' } });
		Matter.Composite.add(ropeB, Matter.Constraint.create({
			bodyB: ropeB.bodies[0],
			pointB: { x: -20, y: 0 },
			pointA: { x: ropeB.bodies[0].position.x, y: ropeB.bodies[0].position.y },
			stiffness: 0.5
		}));

		group = Matter.Body.nextGroup(true);

		let ropeC = Matter.Composites.stack(600, 50, 13, 1, 10, 10, (x, y) => {
			return Matter.Bodies.rectangle(x - 20, y, 50, 20, <any>{ collisionFilter: { group: group }, chamfer: 5 });
		});

		Matter.Composites.chain(ropeC, 0.3, 0, -0.3, 0, { stiffness: 1, length: 0 });
		Matter.Composite.add(ropeC, Matter.Constraint.create({
			bodyB: ropeC.bodies[0],
			pointB: { x: -20, y: 0 },
			pointA: { x: ropeC.bodies[0].position.x, y: ropeC.bodies[0].position.y },
			stiffness: 0.5
		}));

		Matter.World.add(binder.mWorld, [
			ropeA,
			ropeB,
			ropeC,
			<any>Matter.Bodies.rectangle(400, 600, 1200, 50.5, { isStatic: true })
		]);
	}
}