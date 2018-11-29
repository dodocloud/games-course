import { ATTR_AI_MODEL, MAP_BLOCK_SIZE, ATTR_AGENT_MODEL } from './Constants';
import { AIModel, AgentModel } from './AIModel';
import Component from "../../ts/engine/Component";
import Vec2 from '../../ts/utils/Vec2';
import { Path, PathContext } from '../../ts/utils/Path';
import { DynamicsComponent } from '../../ts/components/DynamicsComponent';
import { SteeringMath } from '../../ts/utils/SteeringMath';

/**
 * Base class for all steering components
 */
abstract class SteeringComponent extends DynamicsComponent {
    math = new SteeringMath();

    protected abstract calcForce(delta: number): Vec2;

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
        let ownerPx = this.owner.getPixiObj();
        let desiredRotation = currentAngle + Math.PI / 2;
        let currentRotation = ownerPx.rotation;

        let rotated = Math.abs(currentRotation - desiredRotation) < 0.1;
        if (!rotated) {
            ownerPx.rotation = currentRotation + Math.sign(desiredRotation - currentRotation) * 0.2;
        }
    }
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
        super(30); // 30x speed
        this.path = path;
        this.pointTolerance = pointTolerance;
        this.finalPointTolerance = finalPointTolerance;
        this.maxVelocity = maxVelocity;
        this.slowingRadius = slowingRadius;
        this.context = new PathContext();
    }


    protected calcForce(delta: number): Vec2 {
        let ownerPos = new Vec2(this.owner.getPixiObj().position.x, this.owner.getPixiObj().position.y);
        let result = this.math.follow(ownerPos, this.dynamics.velocity, this.path, this.context, this.pointTolerance,
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
export class AgentAIMoveComponent extends FollowSteering {
    constructor() {
        super(new Path(), 15, 15, 5, 3);
    }

    gameModel: AIModel;
    agentModel: AgentModel;

    onInit() {
        this.gameModel = this.scene.getGlobalAttribute(ATTR_AI_MODEL);
        this.agentModel = this.owner.getAttribute(ATTR_AGENT_MODEL);
        this.gameSpeed = this.agentModel.speed;
        super.onInit();
    }

    onUpdate(delta: number, absolute: number) {
        if (!this.pathFinished && this.path.segments.length > 2) {
            super.onUpdate(delta, absolute);
        }
    }

    goToPoint(startPos: Vec2, startLoc: Vec2, goal: Vec2) {

        let directionPath = new Array<Vec2>();
        let foundpath = new Array<Vec2>();
        // 1) find path from start to goal
        this.gameModel.map.findPath(startPos, goal, foundpath, directionPath);

        // 2) transform path from map-coords into world-coords

        let locPath = this.gameModel.map.mapBlockToLocations(foundpath);

        // set all points to the center of each block
        for (let loc of locPath) {
            loc.x += MAP_BLOCK_SIZE / 2;
            loc.y += MAP_BLOCK_SIZE / 2;
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