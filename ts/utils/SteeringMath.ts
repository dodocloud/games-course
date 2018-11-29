import { Path, PathContext } from './Path';
import Vec2 from '../../ts/utils/Vec2';
import Dynamics from '../../ts/utils/Dynamics';


export class SteeringMath {

    seek(target: Vec2, position: Vec2, currentVelocity: Vec2, maxVelocity: number, slowingRadius: number) {
        let desired = target.subtract(position);
        let distance = desired.magnitude();
        desired = desired.normalize();
        if (distance <= slowingRadius) {
            desired = desired.multiply(maxVelocity * (distance / slowingRadius));
        } else {
            desired = desired.multiply(maxVelocity);
        }

        let force = desired.subtract(currentVelocity);
        return force;
    }

    flee(target: Vec2, position: Vec2, currentVelocity: Vec2, maxVelocity: number) {
        let desired = position.subtract(target);
        desired = desired.normalize();
        desired = desired.multiply(maxVelocity);
        let force = desired.subtract(currentVelocity);
        return force;
    }


    evade(target: Vec2, position: Vec2, maxVelocity: number, currentVelocity: Vec2, targetVelocity: Vec2) {
        let distance = target.subtract(position);
        var updatesNeeded = distance.magnitude() / maxVelocity;
        var tv = targetVelocity.multiply(updatesNeeded);
        let targetFuturePosition = target.add(tv);
        return this.flee(targetFuturePosition, position, currentVelocity, maxVelocity);
    }

    pursuit(target: Vec2, position: Vec2, maxVelocity: number, currentVelocity: Vec2, targetVelocity: Vec2) {
        let distance = target.subtract(position);
        let updatesNeeded = distance.magnitude() / maxVelocity;
        let tv = targetVelocity.multiply(updatesNeeded);
        let targetFuturePosition = target.add(tv);
        return this.seek(targetFuturePosition, position, currentVelocity, maxVelocity, 0);
    }

    follow(position: Vec2, currentVelocity: Vec2, path: Path, context: PathContext, pointTolerance: number, 
        finalPointTolerance: number, maxVelocity: number, slowingRadius: number): Vec2 {
    
        let radiusTolerance = context.currentPointIndex == (path.segments.length - 1) ? finalPointTolerance : pointTolerance;
    
        path.calcTargetPoint(radiusTolerance, position, context);

        if (position.distance(context.targetLocation) <= finalPointTolerance) {
            return null; // nowhere to go to
        }
    
        if(context.currentPointIndex == (path.segments.length - 1)) {
            // final point -> use arrive
            return this.seek(context.targetLocation, position, currentVelocity, maxVelocity, slowingRadius);
        } else {
            return this.seek(context.targetLocation, position, currentVelocity, maxVelocity, 0);
        }
    }
    
    wander(dynamics: Dynamics, wanderTarget: Vec2, wanderRadius: number, wanderDistance: number,
        wanderJitter: number, deltaTime: number) {

        let randomVec = new Vec2(Math.random()*2-1, Math.random()*2-1);
        let wTarget = wanderTarget.clone();
        wTarget = wTarget.add(randomVec.multiply(deltaTime * wanderJitter));
        wTarget = wTarget.normalize();
        wTarget = wTarget.multiply(wanderRadius);

        let direction = dynamics.velocity.normalize();
        let shift = wanderTarget.add(direction.multiply(wanderDistance));

        // change wander target
        wanderTarget.x = wTarget.x;
        wanderTarget.y = wTarget.y;

        return shift;
    }

    setAngle(vector: Vec2, value: number) {
        var len = vector.magnitude();
        vector.x = Math.cos(value) * len;
        vector.y = Math.sin(value) * len;
    }

    wanderCalc(currentVelocity: Vec2, wanderDistance: number, wanderRadius: number, wanderAngle: number) {
        let wanderCenter = currentVelocity.clone();
        wanderCenter = wanderCenter.normalize();
        wanderCenter = wanderCenter.multiply(wanderDistance);

        //calculate displacement force
        var displacement = new Vec2(0, -1);
        displacement = displacement.multiply(wanderRadius);


        displacement.x = Math.cos(wanderAngle) * displacement.magnitude();
        displacement.y = Math.sin(wanderAngle) * displacement.magnitude();

        let wanderForce = wanderCenter.add(displacement);
        return wanderForce;
    }

    wanderCalcAngle(wanderAngle: number, angleChange: number) {
        wanderAngle += (Math.random() * angleChange) - (angleChange * 0.5);
        return wanderAngle;
    }
}