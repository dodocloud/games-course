import * as ECS from '../../libs/pixi-ecs';
import { Attrs, Tags, Messages, SCENE_WIDTH } from './constants';

export enum CollisionType {
	SOLID_OBJECT = 'SOLID_OBJECT',
	BORDER = 'BORDER',
	BOTTOM = 'BOTTOM',
}

export type BallCollisionMessage = {
	ball: ECS.Container;
	collider: ECS.Container;
	ballBox: PIXI.Rectangle;
	cBox: PIXI.Rectangle;
	type: CollisionType;
	horizIntersection: number;
	vertIntersection: number;
}

export class BallCollisionTrigger extends ECS.Component {

	onUpdate(delta: number, absolute: number) {
		const ball = this.scene.findObjectByTag(Tags.BALL);
		const bricks = this.scene.findObjectsByTag(Tags.BRICK);
		const paddle = this.scene.findObjectByTag(Tags.PADDLE);

		const colliders = [...bricks, paddle];
		const ballBox = ball.getBounds();

		for (let collider of colliders) {
			const cBox = collider.getBounds();
			const horizIntersection = this.horizIntersection(ballBox, cBox);
			const vertIntersection = this.vertIntersection(ballBox, cBox);

			const collides = horizIntersection > 0 && vertIntersection > 0;

			if (collides) {
				this.sendMessage(Messages.BALL_COLLIDED, {
					ball,
					collider,
					ballBox,
					cBox,
					horizIntersection,
					vertIntersection,
					type: CollisionType.SOLID_OBJECT,
				} as BallCollisionMessage);
				return;
			}
		}

		if (ballBox.left < 0 || ballBox.right > SCENE_WIDTH) {
			this.sendMessage(Messages.BALL_COLLIDED, {
				ball,
				ballBox,
				vertIntersection: 1,
				type: CollisionType.BORDER
			})
		}

		if (ballBox.top < 0) {
			this.sendMessage(Messages.BALL_COLLIDED, {
				ball,
				ballBox,
				horizIntersection: 1,
				type: CollisionType.BORDER
			})
		}
		if (ballBox.top > this.scene.getGlobalAttribute<number>(Attrs.SCENE_HEIGHT)) {
			this.sendMessage(Messages.BALL_COLLIDED, {
				ball,
				ballBox,
				type: CollisionType.BOTTOM
			})
		}
	}

	private horizIntersection(boundsA: PIXI.Rectangle, boundsB: PIXI.Rectangle) {
		return Math.min(boundsA.right, boundsB.right) - Math.max(boundsA.left, boundsB.left);
	}

	private vertIntersection(boundsA: PIXI.Rectangle, boundsB: PIXI.Rectangle) {
		return Math.min(boundsA.bottom, boundsB.bottom) - Math.max(boundsA.top, boundsB.top);
	}
}