import * as ECSA from '../../../libs/pixi-component';
import { SteeringMath } from '../../../libs/pixi-math/math/steering';

const ATTR_VELOCITY = 'velocity';
const ATTR_ACCELERATION = 'acceleration';

const MAX_VELOCITY = 1000;

/**
 * Base class for all steering components
 */
export abstract class SteeringComponent extends ECSA.Component {
  protected math = new SteeringMath();
  protected gameSpeed: number;
  protected initialVelocity: ECSA.Vector;

  constructor(gameSpeed: number = 1, initialVelocity: ECSA.Vector = new ECSA.Vector(0, 0)) {
    super();
    this.gameSpeed = gameSpeed;
    this.initialVelocity = initialVelocity;
  }

  onInit() {
    super.onInit();
    this.owner.assignAttribute(ATTR_VELOCITY, this.initialVelocity);
    this.owner.assignAttribute(ATTR_ACCELERATION, new ECSA.Vector(0, 0));
  }

  get velocity(): ECSA.Vector {
    return this.owner.getAttribute<ECSA.Vector>(ATTR_VELOCITY);
  }

  set velocity(velocity: ECSA.Vector) {
    this.owner.assignAttribute(ATTR_VELOCITY, velocity);
  }

  get acceleration(): ECSA.Vector {
    return this.owner.getAttribute<ECSA.Vector>(ATTR_ACCELERATION);
  }

  set acceleration(acceleration: ECSA.Vector) {
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

    this.applyVelocity(delta, this.gameSpeed);
    this.applyPosition(delta, this.gameSpeed);

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

  protected abstract calcForce(delta: number): ECSA.Vector;
}

export class SeekSteering extends SteeringComponent {
  target: PIXI.Container;

  constructor(target: PIXI.Container) {
    super(10, new ECSA.Vector(100,25));
    this.target = target;
  }

  protected calcForce(delta: number): ECSA.Vector {
    let targetPos = new ECSA.Vector(this.target.position.x, this.target.position.y);
    let ownerPos = new ECSA.Vector(this.owner.position.x, this.owner.position.y);
    let result = this.math.seek(targetPos, ownerPos, this.velocity, MAX_VELOCITY, null).limit(5);
    if(targetPos.distance(ownerPos) < 1) {
      this.finish();
      return null;
    }
    return result;
  }
}

export class EvadeSteering extends SteeringComponent {
  target: ECSA.Container;

  constructor(target: ECSA.Container) {
    super(8);
    this.target = target;
  }

  protected calcForce(delta: number): ECSA.Vector {
    let targetPos = new ECSA.Vector(this.target.position.x, this.target.position.y);
    let ownerPos = new ECSA.Vector(this.owner.position.x, this.owner.position.y);
    let targetVelocity = this.target.getAttribute<ECSA.Vector>(ATTR_VELOCITY);
    return this.math.evade(targetPos, ownerPos, 30, this.velocity, targetVelocity);
  }
}

/**
 * Component for Pursuit
 */
export class PursuitSteering extends SteeringComponent {
  target: ECSA.Container;

  constructor(target: ECSA.Container) {
    super(10);
    this.target = target;
  }

  protected calcForce(delta: number): ECSA.Vector {
    let targetPos = new ECSA.Vector(this.target.position.x, this.target.position.y);
    let ownerPos = new ECSA.Vector(this.owner.position.x, this.owner.position.y);
    let targetVelocity = this.target.getAttribute<ECSA.Vector>(ATTR_VELOCITY);
    return this.math.pursuit(targetPos, ownerPos, 300, this.velocity, targetVelocity);
  }
}


/**
 * Component for Wander
 */
export class WanderSteering extends SteeringComponent {
  wanderTarget = new ECSA.Vector(0, 0);
  angle = 0;
  boid: PIXI.Container;
  circle: PIXI.Container;
  dot: PIXI.Container;
  wanderDistance: number;
  wanderRadius: number;
  wanderJittering: number;

  constructor(wanderDistance: number, wanderRadius: number, wanderJittering: number, boid: ECSA.Container, dot?: ECSA.Container, circle?: ECSA.Container) {
    super(10, new ECSA.Vector(1,1));
    this.wanderDistance = wanderDistance;
    this.wanderRadius = wanderRadius;
    this.wanderJittering = wanderJittering;
    this.boid = boid;
    this.dot = dot;
    this.circle = circle;
  }


  onUpdate(delta: number, absolute: number) {
    super.onUpdate(delta, absolute);

    let desiredAngle = Math.atan2(this.acceleration.y, this.acceleration.x);
    let currentAngle = Math.atan2(this.velocity.y, this.velocity.x);

    if(!this.dot) {
      this.boid.rotation = currentAngle;
    }

    if(this.dot) {
      this.dot.position.set(this.wanderDistance + Math.cos(desiredAngle - currentAngle) * this.wanderRadius, Math.sin(desiredAngle - currentAngle) * this.wanderRadius);
    }
    if(this.circle) {
      this.circle.position.set(this.wanderDistance, 0);
    }
  }

  protected calcForce(delta: number): ECSA.Vector {
    let force =  this.math.wander(this.velocity, this.wanderTarget, this.wanderRadius, this.wanderDistance, this.wanderJittering, delta);
    this.wanderTarget = force[1];
    return force[0];
  }
}