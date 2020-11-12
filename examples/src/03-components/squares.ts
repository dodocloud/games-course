import * as ECS from '../../libs/pixi-ecs';
import { ECSExample } from '../utils/APHExample';

const FLAG_ROTATING = 1;

class RotationAnim extends ECS.Component {

	onInit() {
		this.subscribe('ROTATION_FINISHED');
	}

	onMessage(msg: ECS.Message) {
		if (msg.action === 'ROTATION_FINISHED') {
			this.owner.setFlag(FLAG_ROTATING);
		}
	}

	onUpdate(delta: number, absolute: number) {
		if (this.owner.hasFlag(FLAG_ROTATING)) {
			this.owner.rotation += delta * 0.004;
			if (this.owner.rotation >= 2 * Math.PI) {
				this.owner.rotation = 0;
				this.sendMessage('ROTATION_FINISHED');
				this.owner.resetFlag(FLAG_ROTATING);
			}
		}
	}
}

export class Squares extends ECSExample {

	load() {
		let square1 = new ECS.Graphics();
		square1.beginFill(0xFF0000);
		square1.drawRect(0, 0, 200, 200);
		square1.endFill();
		square1.pivot.set(100, 100);
		square1.position.set(0.25 * this.canvas.width, 0.5 * this.canvas.height);

		let square2 = new ECS.Graphics();
		square2.beginFill(0x0000FF);
		square2.drawRect(0, 0, 200, 200);
		square2.endFill();
		square2.pivot.set(100, 100);
		square2.position.set(0.75 * this.canvas.width, 0.5 * this.canvas.height);

		square1.addComponent(new RotationAnim());
		square1.setFlag(FLAG_ROTATING);
		square2.addComponent(new RotationAnim());

		this.engine.scene.stage.addChild(square1);
		this.engine.scene.stage.addChild(square2);
	}
}