import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';
import { PursuitComponent, WanderComponent } from './steering-base';
import { colors } from '../utils/colors';

export class SteeringPursuit extends ECSExample {

	load() {
		let scene = this.engine.scene;
		let wanderBoid = new ECS.Graphics('WANDER');
		wanderBoid.beginFill(PIXI.utils.string2hex(colors.lemon));
		wanderBoid.drawPolygon([-10, -10, -10, 10, 15, 0]);
		wanderBoid.endFill();
		wanderBoid.position.set(scene.app.screen.width * 0.7, scene.app.screen.height * 0.8);
		wanderBoid.scale.set(2);
		wanderBoid.addComponent(new WanderComponent(
			{
				speed: 10,
				initialVelocity: new ECS.Vector(1, 1),
				distance: 20,
				radius: 10,
				jittering: 0.1,
				boid: wanderBoid
			}));
		scene.stage.addChild(wanderBoid);

		let pursuitBoid = new ECS.Graphics('PURSUIT');
		pursuitBoid.beginFill(PIXI.utils.string2hex(colors.emerald));
		pursuitBoid.drawPolygon([-10, -10, -10, 10, 15, 0]);
		pursuitBoid.endFill();
		pursuitBoid.position.set(scene.app.screen.width / 4, scene.app.screen.height / 2);
		pursuitBoid.scale.set(3);
		scene.stage.addChild(pursuitBoid);
		pursuitBoid.addComponent(new PursuitComponent({
			target: wanderBoid,
			speed: 10,
		}));
	}
}
