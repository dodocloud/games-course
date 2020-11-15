import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';
import { Steering } from '../../libs/aph-math';

const ATTR_VELOCITY = 'velocity';
const ATTR_ACCELERATION = 'acceleration';

const MAX_VELOCITY = 1000;

export type SteeringComponentProps = {
	speed: number;
	initialVelocity?: ECS.Vector;
}

export abstract class SteeringComponentBase<T extends SteeringComponentProps> extends ECS.Component<T> {

	onInit() {
		super.onInit();

		const initialVelocity = this.props.initialVelocity || new ECS.Vector(0);

		this.owner.assignAttribute(ATTR_VELOCITY, initialVelocity);
		this.owner.assignAttribute(ATTR_ACCELERATION, new ECS.Vector(0, 0));
	}

	get velocity(): ECS.Vector {
		return this.owner.getAttribute<ECS.Vector>(ATTR_VELOCITY);
	}

	set velocity(velocity: ECS.Vector) {
		this.owner.assignAttribute(ATTR_VELOCITY, velocity);
	}

	get acceleration(): ECS.Vector {
		return this.owner.getAttribute<ECS.Vector>(ATTR_ACCELERATION);
	}

	set acceleration(acceleration: ECS.Vector) {
		this.owner.assignAttribute(ATTR_ACCELERATION, acceleration);
	}

	onUpdate(delta: number, absolute: number) {
		// update dynamics and set new position
		let force = this.calcForce(delta);
		if (force == null) {
			return; // algorithm has finished
		}

		this.acceleration = force;
		// limit acceleration and velocity
		this.acceleration = this.acceleration.limit(30);
		this.velocity = this.velocity.limit(MAX_VELOCITY);

		this.applyVelocity(delta, this.props.speed);
		this.applyPosition(delta, this.props.speed);

		// change rotation based on the velocity
		let currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
		this.owner.rotation = currentAngle;

		// check borders - object will be moved to the opposite side of the scene
		let bbox = this.owner.getBounds();
		let area = new PIXI.Rectangle(0, 0, this.scene.app.screen.width, this.scene.app.screen.height);

		if (bbox.right < area.left && this.velocity.x < 0) {
			this.owner.position.x += (area.width + bbox.width);
		}

		if (bbox.left > area.right && this.velocity.x > 0) {
			this.owner.position.x -= (area.width + bbox.width);
		}

		if (bbox.bottom < area.top && this.velocity.y < 0) {
			this.owner.position.y += (area.height + bbox.height);
		}

		if (bbox.top > area.bottom && this.velocity.y > 0) {
			this.owner.position.y -= (area.height + bbox.height);
		}
	}

	protected applyVelocity(delta: number, gameSpeed: number) {
		this.velocity = this.velocity.add(this.acceleration.multiply(delta * 0.001 * gameSpeed));
	}

	protected applyPosition(delta: number, gameSpeed: number) {
		let deltaPos = this.velocity.multiply(delta * 0.001 * gameSpeed);
		this.owner.position.x += deltaPos.x;
		this.owner.position.y += deltaPos.y;
	}

	protected abstract calcForce(delta: number): ECS.Vector;
}

export type SeekComponentProps = SteeringComponentProps & {
	target: PIXI.Container
}

export class SeekComponent extends SteeringComponentBase<SeekComponentProps> {

	protected calcForce(delta: number): ECS.Vector {
		let targetPos = new ECS.Vector(this.props.target.position.x, this.props.target.position.y);
		let ownerPos = new ECS.Vector(this.owner.position.x, this.owner.position.y);
		let result = Steering.seek(targetPos, ownerPos, this.velocity, MAX_VELOCITY, null).limit(5);
		if (targetPos.distance(ownerPos) < 1) {
			this.finish();
			return null;
		}
		return result;
	}
}

export type EvadeComponentProps = SteeringComponentProps & {
	target: ECS.Container
}

export class EvadeComponent extends SteeringComponentBase<EvadeComponentProps> {

	protected calcForce(delta: number): ECS.Vector {
		let targetPos = new ECS.Vector(this.props.target.position.x, this.props.target.position.y);
		let ownerPos = new ECS.Vector(this.owner.position.x, this.owner.position.y);
		let targetVelocity = this.props.target.getAttribute<ECS.Vector>(ATTR_VELOCITY);
		return Steering.evade(targetPos, ownerPos, 30, this.velocity, targetVelocity);
	}
}

export type PursuitComponentProps = SteeringComponentProps & {
	target: ECS.Container
}

export class PursuitComponent extends SteeringComponentBase<PursuitComponentProps> {

	protected calcForce(delta: number): ECS.Vector {
		let targetPos = new ECS.Vector(this.props.target.position.x, this.props.target.position.y);
		let ownerPos = new ECS.Vector(this.owner.position.x, this.owner.position.y);
		let targetVelocity = this.props.target.getAttribute<ECS.Vector>(ATTR_VELOCITY);
		return Steering.pursuit(targetPos, ownerPos, 300, this.velocity, targetVelocity);
	}
}

export type WanderComponentProps = SteeringComponentProps & {
	distance: number;
	radius: number;
	jittering: number;
	boid: ECS.Container;
	dot?: ECS.Container;
	circle?: ECS.Container;
}

export class WanderComponent extends SteeringComponentBase<WanderComponentProps> {
	wanderTarget = new ECS.Vector(0, 0);

	onUpdate(delta: number, absolute: number) {
		super.onUpdate(delta, absolute);

		let desiredAngle = Math.atan2(this.acceleration.y, this.acceleration.x);
		let currentAngle = Math.atan2(this.velocity.y, this.velocity.x);

		if (!this.props.dot) {
			this.props.boid.rotation = currentAngle;
		}

		if (this.props.dot) {
			this.props.dot.position.set(this.props.distance + Math.cos(desiredAngle - currentAngle) * this.props.radius, 
			Math.sin(desiredAngle - currentAngle) * this.props.radius);
		}
		if (this.props.circle) {
			this.props.circle.position.set(this.props.distance, 0);
		}
	}

	protected calcForce(delta: number): ECS.Vector {
		let force = Steering.wander(this.velocity, this.wanderTarget, this.props.radius,
			this.props.distance, this.props.jittering, delta);
		this.wanderTarget = force[1];
		return force[0];
	}
}