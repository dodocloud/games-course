import * as ECS from '../../libs/pixi-ecs';
import { Messages, SCENE_WIDTH } from './constants';

class PaddleController extends ECS.Component {
	moveLeft(units: number) {
		const bbox = this.owner.getBounds();
		if (bbox.left >= 0) {
			this.owner.position.x -= Math.min(units, bbox.left);
		}
	}

	moveRight(units: number) {
		const bbox = this.owner.getBounds();
		if (bbox.right <= SCENE_WIDTH) {
			this.owner.position.x += Math.min(units, SCENE_WIDTH - bbox.right);
		}
	}
}

export class PaddleKeyboardController extends PaddleController {

	keyInputCmp: ECS.KeyInputComponent;

	onInit() {
		super.onInit();
		this.keyInputCmp = this.scene.findGlobalComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name);
	}

	onUpdate(delta: number, absolute: number) {

		if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_LEFT)) {
			this.moveLeft(delta * 0.01);
		}
		if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_RIGHT)) {
			this.moveRight(delta * 0.01);
		}
		if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_SPACE)) {
			this.keyInputCmp.handleKey(ECS.Keys.KEY_SPACE);
			this.sendMessage(Messages.BALL_RELEASE);
		}
	}
}