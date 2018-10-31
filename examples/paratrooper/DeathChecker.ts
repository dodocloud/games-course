import Component from "../../ts/engine/Component";
import { MSG_UNIT_KILLED } from './constants';
import Msg from '../../ts/engine/Msg';
import { MSG_ANIM_ENDED } from './constants';
import { DeathAnimation } from './DeathAnimation';

export class DeathChecker extends Component {

    runningAnimations = new Map<number, Component>();
    
    constructor(){
        super();
    }
    
    onInit() {
        this.subscribe(MSG_UNIT_KILLED);
        this.subscribe(MSG_ANIM_ENDED);
    }

    onMessage(msg: Msg){
        if(msg.action == MSG_UNIT_KILLED){
            let contextObj = msg.data; // the object is in data
            let anim = new DeathAnimation();
            contextObj.addComponent(anim);
            this.runningAnimations.set(anim.id, anim);
        }

        if(msg.action == MSG_ANIM_ENDED) {
            if(this.runningAnimations.has(msg.component.id)){
                // remove context node from scene
                msg.gameObject.remove();
                this.runningAnimations.delete(msg.component.id);
            }
        }
    }
}