import { STATE_FALLING_PARACHUTE } from './Constants';
import {
    MSG_UNIT_KILLED, STATE_DEAD, MSG_COLLISION, TAG_COPTER, TAG_PARATROOPER,
    STATE_FALLING, STATE_FALLING_WITHOUT_PARACHUTE
} from './Constants';
import Msg from '../../ts/engine/Msg';
import { CollisionInfo } from './CollisionManager';
import { ParatrooperBaseCmp } from "./ParatrooperBaseCmp";

/**
 * Collision resolver component
 */
export class CollisionResolver extends ParatrooperBaseCmp {

    onInit() {
        super.onInit();
        this.subscribe(MSG_COLLISION);
    }

    onMessage(msg: Msg) {
        if (this.model.isGameOver) {
            return;
        }

        if (msg.action == MSG_COLLISION) {
            this.handleCollision(msg);
        }
    }

    // handles collision with all objects
    protected handleCollision(msg: Msg) {
        let trigger = <CollisionInfo>msg.data;

        if (trigger.unit.getTag() == TAG_COPTER) {
            // copter hit -> increase score and change state
            this.model.score += this.model.copterReward;
            trigger.unit.setState(STATE_DEAD);
            this.sendMessage(MSG_UNIT_KILLED, trigger.unit);
        } else if (trigger.unit.getTag() == TAG_PARATROOPER) {
            // we can either kill the paratrooper or remove his parachute and let him fall
            if (trigger.unit.getState() == STATE_FALLING) {
                // paratrooper hit while falling
                this.model.score += this.model.paratrooperShotReward;
                trigger.unit.setState(STATE_DEAD);
                this.sendMessage(MSG_UNIT_KILLED, trigger.unit);
            } else {
                // paratrooper hit while landing
                let unitBB = trigger.unit.getPixiObj().getBounds();
                let projectileBB = trigger.projectile.getPixiObj().getBounds();
                let state = trigger.unit.getState();

                if (state == STATE_FALLING_PARACHUTE && projectileBB.top <= (unitBB.bottom - unitBB.height / 2)) {
                    // remove parachute -> paratrooper is gonna be killed by gravity
                    trigger.unit.setState(STATE_FALLING_WITHOUT_PARACHUTE);
                } else {
                    // we hit the paratrooper's body -> kill him
                    trigger.unit.setState(STATE_DEAD);
                    this.sendMessage(MSG_UNIT_KILLED, trigger.unit);
                }

                // reward is different -> we hit the paratrooper too late
                this.model.score += this.model.paratrooperFallingReward;
            }
        }

        trigger.projectile.remove();
    }
}