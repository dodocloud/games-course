import Vector from '../../pixi-component/utils/vector';

export class SteeringMath {

  seek(target: Vector, position: Vector, currentVelocity: Vector, maxVelocity: number, slowingRadius?: number): Vector {
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

  flee(target: Vector, position: Vector, currentVelocity: Vector, maxVelocity: number): Vector {
    let desired = position.subtract(target);
    desired = desired.normalize();
    desired = desired.multiply(maxVelocity);
    let force = desired.subtract(currentVelocity);
    return force;
  }

  evade(target: Vector, position: Vector, maxVelocity: number, currentVelocity: Vector, targetVelocity: Vector): Vector {
    let distance = target.subtract(position);
    let updatesNeeded = distance.magnitude() / maxVelocity;
    let tv = targetVelocity.multiply(updatesNeeded);
    let targetFuturePosition = target.add(tv);
    return this.flee(targetFuturePosition, position, currentVelocity, maxVelocity);
  }

  pursuit(target: Vector, position: Vector, maxVelocity: number, currentVelocity: Vector, targetVelocity: Vector): Vector {
    let distance = target.subtract(position);
    let updatesNeeded = distance.magnitude() / maxVelocity;
    let tv = targetVelocity.multiply(updatesNeeded);
    let targetFuturePosition = target.add(tv);
    return this.seek(targetFuturePosition, position, currentVelocity, maxVelocity, 0);
  }

  /**
   * Wander behavior
   * @return new force and changed wander target
   */
  wander(velocity: Vector, wanderTarget: Vector, wanderRadius: number, wanderDistance: number,
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
}