import { BallCollisionMessage, CollisionType } from './ball-collision-trigger';
import * as ECS from '../../libs/pixi-ecs';
import { Tags, Messages } from './constants';

export class GameManager extends ECS.Component {
	onInit() {
		this.subscribe(Messages.BALL_COLLIDED);
	}

	onMessage(msg: ECS.Message) {
		if (msg.action === Messages.BALL_COLLIDED) {
			const payload = msg.data as BallCollisionMessage;

			if (payload.type === CollisionType.SOLID_OBJECT) {
				if (payload.collider.hasTag(Tags.BRICK)) {
					payload.collider.destroy();
					// TODO update model
				}
			}
			if (payload.type === CollisionType.BOTTOM) {
				// TODO life lost animation
				this.sendMessage(Messages.BALL_ATTACH);
			}
		}
	}
}