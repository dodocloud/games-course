import * as ECS from '../../../../libs/pixi-ecs';
import { BotModel } from '../model';
import { Attributes, BotTypes } from '../constants';
import Dynamics from '../../../utils/dynamics';


/**
 * Simple agent animation component that only switches between sprite sheet frames
 */
export class BotAnim extends ECS.Component {
	changeFrequency = 10;
	lastSwitchTime = 0;
	texture: PIXI.Texture;

	onInit() {
		this.texture = this.owner.asSprite().texture;
		let model = this.owner.getAttribute<BotModel>(Attributes.BOT_MODEL);
		// no animation
		if (model.agentType === BotTypes.BLUE) {
			this.texture.frame = new PIXI.Rectangle(0, 0, 128, 128);
		} else {
			this.texture.frame = new PIXI.Rectangle(0, 128, 128, 128);
		}
	}

	onUpdate(delta: number, absolute: number) {
		let model = this.owner.getAttribute<BotModel>(Attributes.BOT_MODEL);
		let dynamics = this.owner.getAttribute<Dynamics>(Attributes.DYNAMICS);
		let velocity = dynamics.velocity;

		if (velocity.magnitude() < 1) {
			// no animation
			if (model.agentType === BotTypes.BLUE) {
				this.texture.frame = new PIXI.Rectangle(0, 0, 128, 128);
			} else {
				this.texture.frame = new PIXI.Rectangle(0, 128, 128, 128);
			}
		} else {
			if (this.checkTime(this.lastSwitchTime, absolute, this.changeFrequency)) {
				let currentFrameX = this.texture.frame.x / 128;
				currentFrameX = (currentFrameX + 1) % 4;
				if (currentFrameX === 0) {
					currentFrameX = 1;
				}
				// switch animation
				if (model.agentType === BotTypes.BLUE) {
					this.texture.frame = new PIXI.Rectangle(128 * currentFrameX, 0, 128, 128);
				} else {
					this.texture.frame = new PIXI.Rectangle(128 * currentFrameX, 128, 128, 128);
				}
			}
		}
	}

	private checkTime(lastTime: number, time: number, frequency: number) {
		return (time - lastTime) > 1000 / frequency;
	}
}