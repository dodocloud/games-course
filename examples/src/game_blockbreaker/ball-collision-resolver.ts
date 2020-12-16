import * as ECS from '../../libs/pixi-ecs';
import { BallCollisionMessage, CollisionType } from './ball-collision-trigger';
import { Attrs, Tags, Messages } from './constants';

export class BallCollisionResolver extends ECS.Component {

	onInit() {
		this.subscribe(Messages.BALL_COLLIDED);
	}

	onMessage(msg: ECS.Message) {
		if (msg.action === Messages.BALL_COLLIDED) {
			const payload = msg.data as BallCollisionMessage;
			const { ball, collider, cBox, ballBox, type } = payload;
			const velocity = ball.getAttribute<ECS.Vector>(Attrs.VELOCITY);

			let newVelocity: ECS.Vector;

			if (type === CollisionType.SOLID_OBJECT) {
				if (collider.hasTag(Tags.BRICK)) {
					if (payload.horizIntersection < payload.vertIntersection) {
						newVelocity = new ECS.Vector(-velocity.x, velocity.y);
					} else {
						newVelocity = new ECS.Vector(velocity.x, -velocity.y);
					}
				} else if (collider.hasTag(Tags.PADDLE)) {
					const magnitude = velocity.magnitude();
					if ((ballBox.left + ballBox.width / 2) > (cBox.left + cBox.width / 2)) {
						newVelocity = new ECS.Vector(velocity.x + magnitude / 5, -velocity.y).normalize().multiply(magnitude);
					} else {
						newVelocity = new ECS.Vector(velocity.x - magnitude / 5, -velocity.y).normalize().multiply(magnitude);
					}
				}
			} else if (type === CollisionType.BORDER) {
				if (payload.horizIntersection > 0) {
					newVelocity = new ECS.Vector(velocity.x, -velocity.y);
				} else if (payload.vertIntersection > 0) {
					newVelocity = new ECS.Vector(-velocity.x, velocity.y);
				}
			}


			ball.assignAttribute(Attrs.VELOCITY, newVelocity);

		}
	}

}