import BaseComponent from '../base-component';
import { SteeringState, Messages, Attributes, STEERING_DURATION } from '../constants';
import * as ECSA from '../../../../libs/pixi-component';
import FlickerAnimation from '../viewcomponents/flicker-animation';

// controller for player's car, contains methods that can be invoked from more specific controlers (like CarTouchController)
export default class CarController extends BaseComponent {

  steeringTime: number;
  steeringSourcePosX: number;
  steeringState: SteeringState;
  desiredVelocity: number;

  onInit() {
    super.onInit();
    this.steeringTime = 0; // the time the steering has started
    this.steeringSourcePosX = 0; // initial position when the steering started
    this.steeringState = SteeringState.NONE; // initial steering state

    this.subscribe(Messages.IMMUNE_MODE_STARTED); // subscribe for messages
    this.subscribe(Messages.IMMUNE_MODE_ENDED);

    // set the initial speed
    this.desiredVelocity = this.gameModel.currentMaxSpeed;
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === Messages.IMMUNE_MODE_STARTED) {
      // play the flickering animation and decelerate a little bit
      this.owner.addComponent(new FlickerAnimation(4000));
      this.decelerate(this.gameModel.currentMaxSpeed / 2);
    }

    if (msg.action === Messages.IMMUNE_MODE_ENDED) {
      // accelerate back to the current max speed
      this.accelerate(this.gameModel.currentMaxSpeed);
    }
  }

  // accelerates until it reaches desired velocity
  accelerate(desiredVelocity: number) {
    this.desiredVelocity = desiredVelocity;
  }

  // decelerates until it reaches desired velocity
  decelerate(desiredVelocity: number) {
    this.desiredVelocity = desiredVelocity;
  }

  // goes to the left lane
  steerLeft() {
    this.steeringState = SteeringState.LEFT;
    this.steeringTime = 0;
    this.steeringSourcePosX = this.owner.pixiObj.position.x;
    let currentCarLane = this.owner.getAttribute<number>(Attributes.LINE);
    this.owner.assignAttribute(Attributes.LINE, currentCarLane - 1); // change the attribute
  }

  // goes to the right line
  steerRight() {
    this.steeringState = SteeringState.RIGHT;
    this.steeringTime = 0;
    this.steeringSourcePosX = this.owner.pixiObj.position.x;
    let currentCarLane = this.owner.getAttribute<number>(Attributes.LINE);
    this.owner.assignAttribute(Attributes.LINE, currentCarLane + 1); // change the attribute
  }

  onUpdate(delta: number, absolute: number) {
    this._handleSpeed(delta, absolute);
    this._handleSteering(delta, absolute);
  }

  // increments speed and handles acceleration to desired velocity (if differs from current speed)
  _handleSpeed(delta: number, absolute: number) {
    let speed = this.owner.getAttribute<number>(Attributes.SPEED);

    // if the maximum speed has increased enough, accelerate to the next velocity level
    if (this.gameModel.currentMaxSpeed > speed * 1.1 && this.desiredVelocity === speed) {
      this.accelerate(this.gameModel.currentMaxSpeed);
    }

    if (this.desiredVelocity !== speed) {
      // if the desired velocity differs, we need to either accelerate or decelerate
      // in order to change the current velocity
      if (this.desiredVelocity > speed) {
        speed = Math.min(this.desiredVelocity, speed + 1 * delta * 0.003);
      } else {
        speed = Math.max(this.desiredVelocity, speed + -1 * delta * 0.003);
      }

      // update the attribute
      this.owner.assignAttribute(Attributes.SPEED, speed);
    }
  }

  _handleSteering(delta: number, absolute: number) {
    let currentCarLane = this.owner.getAttribute<number>(Attributes.LINE);

    if (this.steeringState !== SteeringState.NONE && this.steeringTime === 0) {
      // steering state has changed -> start the steering procedure
      this.steeringTime = absolute;
    }

    if (this.steeringState !== SteeringState.NONE) {

      // handle the steering behavior
      let desiredLocationX = this.spriteMgr.getCenterOfLane(currentCarLane, this.scene.app.screen.width);

      // transform to [0,1] interval
      let progress = Math.min(1, (absolute - this.steeringTime) / STEERING_DURATION);
      // change car location
      this.owner.pixiObj.position.x = this.steeringSourcePosX + (desiredLocationX - this.steeringSourcePosX) * progress;

      if (progress >= 1) {
        // steering has finished
        this.steeringState = SteeringState.NONE;
        this.steeringTime = 0;
      }
    }
  }
}

// component that controls the car according to the mouse or touch events
export class CarTouchController extends CarController {

  onInit() {
    super.onInit();
    this.subscribe(ECSA.PointerMessages.POINTER_TAP);
  }

  onMessage(msg: ECSA.Message) {
    super.onMessage(msg);
    if (msg.action === ECSA.PointerMessages.POINTER_TAP) {
      let posX = msg.data.mousePos.posX;

      let currentCarLane = this.owner.getAttribute(Attributes.LINE);

      if (posX < this.owner.pixiObj.position.x && currentCarLane > 0) {
        this.steerLeft();
      }

      if (posX > (this.owner.pixiObj.position.x + this.spriteMgr.getCar().w) && currentCarLane < 2) {
        this.steerRight();
      }
    }
  }
}
