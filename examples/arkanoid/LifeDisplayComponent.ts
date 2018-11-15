import Component from '../../ts/engine/Component';
import { Model } from './Model';
import { MSG_LIFE_LOST, ATTR_MODEL } from './Constants';
import Msg from '../../ts/engine/Msg';

/**
 * Component that displays number of lives
 */
export class LifeDisplayComponent extends Component {
    private model: Model;

    onInit() {
        this.subscribe(MSG_LIFE_LOST);
        this.model = this.scene.getGlobalAttribute(ATTR_MODEL);
    }

    onMessage(msg: Msg) {
        if (msg.action == MSG_LIFE_LOST) {
            // each icon has its own name, according to the life number
            let lifeName = `life_${this.model.currentLives + 1}`; // + 1 , because we have already lost this one 
            let life = this.scene.findFirstObjectByTag(lifeName);
            life.remove();
        }
    }
}