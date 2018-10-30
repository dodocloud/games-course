import { MSG_ANIM_ENDED } from './constants';
import Component from "../../ts/engine/Component";

export class DeathAnimation extends Component {
    lastSwitch = 0;
    totalSw = 0;

    constructor(){
        super();
    }

    private checkTime(currentTime, lastTime, frequency) {
        return (currentTime - lastTime) > 1000/frequency;
    }

    onUpdate(delta, absolute){
        if(this.checkTime(this.lastSwitch, absolute, 50)){
            this.lastSwitch = absolute;
            this.owner.getPixiObj().visible = !this.owner.getPixiObj().visible;

            if(this.totalSw++ > 4){
                this.finish();
                this.sendMessage(MSG_ANIM_ENDED);
            }
        }
    }
}