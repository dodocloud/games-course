import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';
import { PursuitComponent, EvadeComponent, WanderComponent } from './steering-base';

export class SteeringCombined extends ECSExample {

	objects: ECS.Container[] = [];

	load() {
		for (let i = 0; i < 100; i++) {
			this.createRandomObject();
		}
	}

	private createRandomObject() {
		let scene = this.engine.scene;
		let boid = new ECS.Graphics();
		boid.beginFill((Math.floor(Math.random() * 0xFF) << 16) + (Math.floor(Math.random() * 0xFF) << 8) + (Math.floor(Math.random() * 0xFF)));
		boid.drawPolygon([-10, -10, -10, 10, 15, 0]);
		boid.endFill();
		boid.position.set(scene.app.screen.width * Math.random(), scene.app.screen.height * Math.random());
		boid.scale.set(1 + Math.random() * 3);

		let components = 0;

		if (Math.random() > 0.5 && this.objects.length !== 0) {
			let randomTarget = this.objects[Math.floor(Math.random() * (this.objects.length - 1))];
			boid.addComponent(new PursuitComponent({
				target: randomTarget,
				speed: 10,
			}));
			components++;
		} else if (Math.random() > 0.7 && this.objects.length !== 0) {
			let randomTarget = this.objects[Math.floor(Math.random() * (this.objects.length - 1))];
			boid.addComponent(new EvadeComponent({
				target: randomTarget,
				speed: 8,
			}));
			components++;
		}

		if (Math.random() > 0.5) {
			boid.addComponent(new WanderComponent({
				speed: 10,
				initialVelocity: new ECS.Vector(1, 1),
				distance: Math.random() * 100,
				radius: Math.random() * 50,
				jittering: Math.random(),
				boid
			}));
			components++;
		}

		if (components !== 0) {
			this.objects.push(boid);
			scene.stage.addChild(boid);
		}
	}
}