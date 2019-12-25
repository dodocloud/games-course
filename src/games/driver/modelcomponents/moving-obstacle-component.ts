import BaseComponent from '../base-component';
import { Attributes } from '../constants';

// A very dummy AI component for moving obstacles (cars and trucks)
export default class MovingObstacleComponent extends BaseComponent {

  currentAcceleration: number;
  currentMaxSpeed: number;

  onInit() {
    super.onInit();
    this.currentAcceleration = 0;
    this.currentMaxSpeed = this.owner.getAttribute<number>(Attributes.SPEED);
  }

  onUpdate(delta: number, absolute: number) {
    let currentSpeed = this.owner.getAttribute<number>(Attributes.SPEED);

    // increment position according to the current speed
    this.owner.assignAttribute(Attributes.ROAD_POS_Y, this.owner.getAttribute<number>(Attributes.ROAD_POS_Y) + currentSpeed * delta * 0.01);

    // find nearest obstacle on the same lane
    let nearest = this.obstacleMap.getNearestObstacle(this.owner, true);
    let posY = this.owner.getAttribute<number>(Attributes.ROAD_POS_Y);

    if (nearest != null) {
      let nearestPosY = nearest.getAttribute<number>(Attributes.ROAD_POS_Y);
      // check if the obstacle is close enough
      let distance = (nearestPosY - nearest.pixiObj.getBounds().height) - posY;

      // if we are closer than 200 units, we need to decelerate
      let criticalDistance = this.currentMaxSpeed * 3;
      // try to achieve the same velocity no closer than 20 units behind the nearest obstacle
      let desiredDistance = this.currentMaxSpeed;

      if (distance < criticalDistance) {

        // we have to get to the same velocity
        let desiredSpeed = nearest.getAttribute<number>(Attributes.SPEED);

        if (distance < desiredDistance) {
          // very close!! We need to decelerate faster
          desiredSpeed /= 1.3;
        }

        if (desiredSpeed < currentSpeed) {
          // calculate deceleration in order to be on the same speed cca 20 pixels behind the obstacle
          // a = v^2 / 2s
          this.currentAcceleration = -1 * Math.max(0, (currentSpeed - desiredSpeed)
            * (currentSpeed - desiredSpeed) / (2 * Math.max(1, distance - desiredDistance)));
        }
      } else if (currentSpeed < this.currentMaxSpeed) {
        // no obstacle closer than 200 pixels -> we can accelerate to our max speed
        this.currentAcceleration = 0.3;
      } else {
        this.currentAcceleration = 0;
      }
    }

    // modify velocity according to the current acceleration speed
    // use simple Euler integration method (v' = a*t)
    this.owner.assignAttribute(Attributes.SPEED, Math.max(0, currentSpeed + this.currentAcceleration * delta * 0.01));
  }
}