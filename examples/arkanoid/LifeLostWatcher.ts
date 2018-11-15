import { Model } from './Model';
import { MSG_BALL_OUTSIDE_AREA, ATTR_MODEL, MSG_LIFE_LOST, MSG_COMMAND_GOTO_NEXT_ROUND, MSG_COMMAND_GAME_OVER } from './Constants';
import Component from '../../ts/engine/Component';
import Msg from '../../ts/engine/Msg';

/**
 * Watcher for lost lives
 */
export class LifeLostWatcher extends Component {

    private model: Model;

    onInit() {
        this.subscribe(MSG_BALL_OUTSIDE_AREA);
        this.model = this.scene.getGlobalAttribute(ATTR_MODEL);
    }

    onMessage(msg: Msg) {
        if (msg.action == MSG_BALL_OUTSIDE_AREA) {
            this.resolveBallOutsideArea();
        }
    }

    protected resolveBallOutsideArea() {
        this.model.currentLives--;
        this.sendMessage(MSG_LIFE_LOST);

        if (this.model.currentLives == 0) {
            // game over -> pass messages to the game manager
            this.sendMessage(MSG_COMMAND_GAME_OVER);
        } else {
            this.sendMessage(MSG_COMMAND_GOTO_NEXT_ROUND);
        }
    }
}