import * as ECSA from '../../../libs/pixi-component';
import { Messages, States, Names } from './constants';
import { CollisionInfo } from './collision-manager';
import { ParatrooperBaseCmp } from './paratrooper-base-component';

/**
 * Collision resolver component
 */
export class CollisionResolver extends ParatrooperBaseCmp {

  onInit() {
    super.onInit();
    this.subscribe(Messages.COLLISION_TRIGGERED);
  }

  onMessage(msg: ECSA.Message) {
    if (this.model.isGameOver) {
      return;
    }

    if (msg.action === Messages.COLLISION_TRIGGERED) {
      this.handleCollision(msg);
    }
  }

  // handles collision with all objects
  protected handleCollision(msg: ECSA.Message) {
    let trigger = <CollisionInfo>msg.data;

    if (trigger.unit.name === Names.COPTER) {
      // copter hit -> increase score and change state
      this.model.score += this.model.copterReward;
      this.killUnit(trigger.unit);
    } else if (trigger.unit.name === Names.PARATROOPER) {
      // we can either kill the paratrooper or remove his parachute and let him fall
      if (trigger.unit.stateId === States.FALLING) {
        // paratrooper hit while falling
        this.model.score += this.model.paratrooperShotReward;
        this.killUnit(trigger.unit);
      } else {
        // paratrooper hit while landing
        let unitBB = trigger.unit.pixiObj.getBounds();
        let projectileBB = trigger.projectile.pixiObj.getBounds();
        let state = trigger.unit.stateId;

        if (state === States.FALLING_PARACHUTE && projectileBB.top <= (unitBB.bottom - unitBB.height / 2)) {
          // remove parachute -> paratrooper is gonna be killed by gravity
          trigger.unit.stateId = States.FALLING_WITHOUT_PARACHUTE;
        } else {
          // we hit the paratrooper's body -> kill him
          this.killUnit(trigger.unit);
        }

        // reward is different -> we hit the paratrooper too late
        this.model.score += this.model.paratrooperFallingReward;
      }
    }

    trigger.projectile.remove();
  }
}