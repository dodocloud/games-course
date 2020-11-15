import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';
import { WanderComponent } from './steering-base';
import { colors } from '../utils/colors';

export class SteeringWander extends ECSExample {

	load() {
		this.createWander(100, 50, 0.1, PIXI.utils.string2hex(colors.lemon));
		this.createWander(50, 20, 0.5, PIXI.utils.string2hex(colors.lemon));
		this.createWander(0, 50, 0.8, PIXI.utils.string2hex(colors.lemon));
		this.createWander(20, 60, 0.9, PIXI.utils.string2hex(colors.lemon));
	}

	private createWander(distance: number, radius: number, jittering: number, color: number) {
		let scene = this.engine.scene;
		let parent = new ECS.Container('PARENT');
		scene.app.stage.addChild(parent);

		let circle = new ECS.Graphics('CIRCLE');
		circle.lineStyle(2, 0xFF00FF);
		circle.drawCircle(0, 0, radius);
		circle.endFill();
		parent.addChild(circle);

		let dot = new ECS.Graphics('DOT');
		dot.beginFill(0xFFFFFF);
		dot.drawCircle(0, 0, 10);
		dot.endFill();
		parent.addChild(dot);

		let boid = new ECS.Graphics('WANDER');
		boid.beginFill(color);
		boid.drawPolygon([-10, -10, -10, 10, 15, 0]);
		boid.endFill();
		boid.scale.set(3);
		parent.addChild(boid);
		parent.position.set(scene.app.screen.width * Math.random(), scene.app.screen.height * Math.random());
		parent.addComponent(new WanderComponent({speed: 10, initialVelocity: new ECS.Vector(1, 1),
			distance, radius, jittering, boid, dot, circle}));
	}
}