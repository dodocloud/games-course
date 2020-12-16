import * as ECS from '../../../../libs/pixi-ecs';
import { MAP_BLOCK_SIZE, Attributes } from '../constants';
import { GameModel, BotModel } from '../model';
import { Path, PathContext, Steering } from '../../../../libs/aph-math';
import DynamicsComponent from '../../../utils/dynamics-component';

/**
 * Base class for all steering components
 */
abstract class SteeringComponent extends DynamicsComponent {

	onUpdate(delta: number, absolute: number) {

		// update dynamics and set new position
		let force = this.calcForce(delta);
		if (force == null) {
			return;
		}

		this.dynamics.aceleration = force;
		this.dynamics.aceleration = this.dynamics.aceleration.limit(30);
		this.dynamics.velocity = this.dynamics.velocity.limit(30);
		super.onUpdate(delta, absolute);

		// change rotation based on the velocity
		let currentAngle = Math.atan2(this.dynamics.velocity.y, this.dynamics.velocity.x);
		let currentRotation = this.owner.rotation;
		let desiredRotation = currentAngle + Math.PI / 2;
		if (((desiredRotation + 2 * Math.PI) - currentRotation) < (currentRotation - desiredRotation)) {
			// rotation from 270° to 360° looks better than back to 0°
			desiredRotation += 2 * Math.PI;
		}

		let rotated = Math.abs(currentRotation - desiredRotation) < 0.1;
		if (!rotated) {
			this.owner.rotation = currentRotation + Math.sign(desiredRotation - currentRotation) * 0.2;
		}
	}

	protected abstract calcForce(delta: number): ECS.Vector;
}


/**
 * Component for Follow
 */
class FollowSteering extends SteeringComponent {

	path: Path;
	context: PathContext;
	pointTolerance = 20;
	finalPointTolerance = 3;
	maxVelocity = 8;
	slowingRadius = 30;
	pathFinished = false;

	constructor(path: Path, pointTolerance: number, finalPointTolerance: number, maxVelocity: number, slowingRadius: number) {
		super(Attributes.DYNAMICS, 30); // 30x speed
		this.path = path;
		this.pointTolerance = pointTolerance;
		this.finalPointTolerance = finalPointTolerance;
		this.maxVelocity = maxVelocity;
		this.slowingRadius = slowingRadius;
		this.context = new PathContext();
	}


	protected calcForce(delta: number): ECS.Vector {
		let ownerPos = new ECS.Vector(this.owner.position.x, this.owner.position.y);
		let result = Steering.follow(ownerPos, this.dynamics.velocity, this.path, this.context, this.pointTolerance,
			this.finalPointTolerance, this.maxVelocity, this.slowingRadius);

		this.pathFinished = result == null;
		return result;
	}

	protected resetPath(path: Path) {
		this.pathFinished = false;
		this.path = path;
		this.context.currentPointIndex = -1;
	}
}

/**
 * Component for movement
 */
export class BotMove extends FollowSteering {

	gameModel: GameModel;
	botModel: BotModel;

	constructor() {
		super(new Path(), 15, 15, 5, 3);
	}

	onInit() {
		this.gameModel = this.scene.getGlobalAttribute(Attributes.GAME_MODEL);
		this.botModel = this.owner.getAttribute(Attributes.BOT_MODEL);
		this.gameSpeed = this.botModel.speed;
		super.onInit();
	}

	onUpdate(delta: number, absolute: number) {
		if (!this.pathFinished && this.path.segments.length > 2) {
			super.onUpdate(delta, absolute);
		} else {
			this.dynamics.aceleration = new ECS.Vector(0, 0);
			this.dynamics.velocity = new ECS.Vector(0, 0);
		}
	}

	goToPoint(startPos: ECS.Vector, startLoc: ECS.Vector, goal: ECS.Vector) {

		let directionPath = new Array<ECS.Vector>();
		let foundpath = new Array<ECS.Vector>();
		// 1) find path from start to goal
		this.gameModel.map.findPath(startPos, goal, foundpath, directionPath);

		// 2) transform path from map-coords into world-coords
		let locPath = this.gameModel.map.mapBlockToLocations(foundpath);

		// set all points to the center of each block
		for (let i = 0; i < locPath.length; i++) {
			let loc = locPath[i];
			locPath[i] = new ECS.Vector(loc.x + MAP_BLOCK_SIZE / 2, loc.y + MAP_BLOCK_SIZE / 2);
		}

		// 3) add segments into followPath object
		this.path.addFirstSegment(locPath[0], locPath[1]);

		for (let i = 2; i < locPath.length; i++) {
			this.path.addSegment(locPath[i]);
		}

		// 4) start followBehavior
		this.resetPath(this.path);
	}
}