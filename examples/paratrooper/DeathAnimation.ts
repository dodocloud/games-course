import { MSG_ANIM_ENDED } from './constants';
import Component from "../../ts/engine/Component";
import { checkTime } from './Utils';
import { ParatrooperBaseCmp } from './ParatrooperBaseCmp';

/**
 * Simple flicker animation that only changes visibility of the object
 */
export class DeathAnimation extends ParatrooperBaseCmp {
    lastSwitch = 0;
    totalSw = 0;

    onUpdate(delta, absolute) {
        if (checkTime(this.lastSwitch, absolute, 50)) {
            this.lastSwitch = absolute;
            this.owner.getPixiObj().visible = !this.owner.getPixiObj().visible;

            if (this.totalSw++ > 4) {
                this.finish();
                this.sendMessage(MSG_ANIM_ENDED);
            }
        }
    }
}