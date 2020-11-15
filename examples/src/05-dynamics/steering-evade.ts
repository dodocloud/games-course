import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';
import { PursuitComponent, EvadeComponent } from './steering-base';
import { colors } from '../utils/colors';


export class SteeringEvade extends ECSExample {

	load() {
		let scene = this.engine.scene;
		let evadeBoid = new ECS.Graphics('EVADE');
		let pursuitBoid = new ECS.Graphics('PURSUIT');
		evadeBoid.beginFill(PIXI.utils.string2hex(colors.royal));
		evadeBoid.drawPolygon([-10, -10, -10, 10, 15, 0]);
		evadeBoid.endFill();
		evadeBoid.position.set(scene.app.screen.width * 0.7, scene.app.screen.height * 0.8);
		evadeBoid.scale.set(2);
		evadeBoid.addComponent(new EvadeComponent({
			target: pursuitBoid,
			initialVelocity: new ECS.Vector(1, 5),
			speed: 8,
		}));


		pursuitBoid.beginFill(PIXI.utils.string2hex(colors.emerald));
		pursuitBoid.drawPolygon([-10, -10, -10, 10, 15, 0]);
		pursuitBoid.endFill();
		pursuitBoid.position.set(scene.app.screen.width / 4, scene.app.screen.height / 2);
		pursuitBoid.scale.set(3);
		scene.stage.addChild(pursuitBoid);
		pursuitBoid.addComponent(new PursuitComponent({
			target: evadeBoid,
			speed: 10,
		}));
		scene.stage.addChild(evadeBoid);
	}
}

