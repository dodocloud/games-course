import { Vector } from '../../pixi-ecs';
import { Path, PathContext } from '../pathfinding/path';


export function seek(target: Vector, position: Vector, currentVelocity: Vector, maxVelocity: number, slowingRadius?: number): Vector {
	let desired = target.subtract(position);
	let distance = desired.magnitude();
	desired = desired.normalize();
	if (slowingRadius && distance <= slowingRadius) {
		desired = desired.multiply(maxVelocity * (distance / slowingRadius));
	} else {
		desired = desired.multiply(maxVelocity);
	}

	let force = desired.subtract(currentVelocity);
	return force;
}

export function flee(target: Vector, position: Vector, currentVelocity: Vector, maxVelocity: number): Vector {
	let desired = position.subtract(target);
	desired = desired.normalize();
	desired = desired.multiply(maxVelocity);
	let force = desired.subtract(currentVelocity);
	return force;
}

export function evade(target: Vector, position: Vector, maxVelocity: number, currentVelocity: Vector, targetVelocity: Vector): Vector {
	let distance = target.subtract(position);
	let updatesNeeded = distance.magnitude() / maxVelocity;
	let tv = targetVelocity.multiply(updatesNeeded);
	let targetFuturePosition = target.add(tv);
	return this.flee(targetFuturePosition, position, currentVelocity, maxVelocity);
}

export function pursuit(target: Vector, position: Vector, maxVelocity: number, currentVelocity: Vector, targetVelocity: Vector): Vector {
	let distance = target.subtract(position);
	let updatesNeeded = distance.magnitude() / maxVelocity;
	let tv = targetVelocity.multiply(updatesNeeded);
	let targetFuturePosition = target.add(tv);
	return this.seek(targetFuturePosition, position, currentVelocity, maxVelocity, 0);
}

export function wander(velocity: Vector, wanderTarget: Vector, wanderRadius: number, wanderDistance: number,
	wanderJitter: number, deltaTime: number): [Vector, Vector] {

	let randomVec = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
	let wTarget = wanderTarget.clone();
	wTarget = wTarget.add(randomVec.multiply(deltaTime * wanderJitter));
	wTarget = wTarget.normalize();
	wTarget = wTarget.multiply(wanderRadius);

	let direction = velocity.normalize();
	let force = wanderTarget.add(direction.multiply(wanderDistance));

	return [force, wTarget];
}

export function follow(position: Vector, currentVelocity: Vector, path: Path, context: PathContext, pointTolerance: number,
	finalPointTolerance: number, maxVelocity: number, slowingRadius: number): Vector {

	let radiusTolerance = context.currentPointIndex === (path.segments.length - 1) ? finalPointTolerance : pointTolerance;

	path.calcTargetPoint(radiusTolerance, position, context);

	if (position.distance(context.targetLocation) <= finalPointTolerance) {
		return null; // nowhere to go to
	}

	if (context.currentPointIndex === (path.segments.length - 1)) {
		// final point -> use arrive
		return this.seek(context.targetLocation, position, currentVelocity, maxVelocity, slowingRadius);
	} else {
		return this.seek(context.targetLocation, position, currentVelocity, maxVelocity, 0);
	}
}