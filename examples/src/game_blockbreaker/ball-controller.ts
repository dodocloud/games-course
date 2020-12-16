import * as ECS from '../../libs/pixi-ecs';
import { Attrs, Messages, Tags, BallStates, SCENE_WIDTH } from './constants';

const releaseSpeed = 0.1;


export class BallController extends ECS.Component {
	paddle: ECS.Container;
	lastAttachPositionX: number;

	get velocity() {
		return this.owner.getAttribute<ECS.Vector>(Attrs.VELOCITY);
	}

	set velocity(velocity: ECS.Vector) {
		this.owner.assignAttribute(Attrs.VELOCITY, velocity);
	}
	
	onInit() {
		this.subscribe(Messages.BALL_ATTACH, Messages.BALL_RELEASE);
		this.paddle = this.scene.findObjectByTag(Tags.PADDLE);
		this.velocity = new ECS.Vector(0);
	}

	onMessage(msg: ECS.Message) {
		if (msg.action === Messages.BALL_ATTACH) {
			if (this.owner.stateId !== BallStates.ATTACHED) {
				this.attachBall();
			}
		} else if (msg.action === Messages.BALL_RELEASE) {
			if (this.owner.stateId !== BallStates.RELEASED) {
				this.releaseBall();
			}
		}
	}

	attachBall() {
		this.owner.stateId = BallStates.ATTACHED;
		this.updateBallAttached();
	}

	releaseBall() {
		this.owner.stateId = BallStates.RELEASED;
		const diffX = this.owner.position.x - this.lastAttachPositionX;
		const diffY = -releaseSpeed;
		this.velocity = new ECS.Vector(diffX / 2, diffY).normalize().multiply(releaseSpeed);
		this.lastAttachPositionX = null;
	}

	updateBallAttached() {
		const paddleBound = this.paddle.getBounds();
		const ballBound = this.owner.getBounds();
		const diffX = paddleBound.left - ballBound.left + paddleBound.width / 2 - ballBound.width / 2;
		const diffY = paddleBound.top - ballBound.bottom;

		this.lastAttachPositionX = this.owner.position.x;
		this.owner.position.x += diffX;
		this.owner.position.y += diffY;
	}

	updateBallMovement(delta: number) {
		this.owner.position.x += delta * this.velocity.x * 0.04;
		this.owner.position.y += delta * this.velocity.y * 0.04;
	}

	onUpdate(delta: number, absolute: number) {
		switch (this.owner.stateId) {
			case BallStates.ATTACHED:
				this.updateBallAttached();
				break;
			case BallStates.RELEASED:
				this.updateBallMovement(delta);
				break;
		}
	}
}