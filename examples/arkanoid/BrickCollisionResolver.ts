import { HitInfo } from './HitInfo';
import { MSG_OBJECT_HIT, ATTR_MODEL, HIT_TYPE_BRICK, BRICK_TYPE_INDSTRUCTIBLE, MSG_COMMAND_FINISH_LEVEL } from './Constants';
import { PIXICmp } from "../../ts/engine/PIXIObject";
import Component from '../../ts/engine/Component';
import Msg from '../../ts/engine/Msg';
import { Model } from './Model';

/**
 * Component that handles collision with bricks
 */
export class BrickCollisionResolver extends Component {
    private model: Model;

    onInit() {
        this.subscribe(MSG_OBJECT_HIT);
        this.model = this.owner.getScene().getGlobalAttribute(ATTR_MODEL);
    }

    onMessage(msg: Msg) {
        if (msg.action == MSG_OBJECT_HIT) {
            let info = <HitInfo>msg.data;
            if (info.hitType == HIT_TYPE_BRICK) {
                this.resolveBrickHit(info);
            }
        }
    }

    protected resolveBrickHit(info: HitInfo) {
        let brick = this.model.brickSprites.get(info.hitObject.getId());
        if (brick.type != BRICK_TYPE_INDSTRUCTIBLE) {
            // decrement number of bricks
            this.model.remainingBricks--;

            // remove brick from the model 
            let position = brick.position;
            this.model.removeBrick(position);
            info.hitObject.remove();

            if(this.model.remainingBricks == 0){
                // send command message in order to finish the current level
                this.sendMessage(MSG_COMMAND_FINISH_LEVEL);
            }
        }
    }
}