import { Factory } from './Factory';
import Component from '../../ts/engine/Component';
import { Model } from './Model';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import {
    MSG_COMMAND_FINISH_LEVEL, ATTR_FACTORY, ATTR_MODEL, TAG_BALL, TAG_PADDLE,
    MSG_GAME_COMPLETED, MSG_LEVEL_COMPLETED, MSG_GAME_OVER, 
    MSG_LEVEL_STARTED, MSG_ROUND_STARTED, MSG_COMMAND_GAME_OVER, MSG_COMMAND_GOTO_NEXT_ROUND
} from './Constants';
import Msg from '../../ts/engine/Msg';
import Dynamics from '../../ts/utils/Dynamics';
import { ATTR_DYNAMICS } from './../../ts/engine/Constants';


/**
 * Component that orchestrates main logic of the game
 */
export class GameComponent extends Component {
    private model: Model;
    private factory: Factory;

    private paddle: PIXICmp.Sprite;
    private ball: PIXICmp.Sprite;

    onInit() {
        this.subscribe(MSG_COMMAND_GAME_OVER, MSG_COMMAND_GOTO_NEXT_ROUND, MSG_COMMAND_FINISH_LEVEL);

        this.factory = this.scene.getGlobalAttribute(ATTR_FACTORY);
        this.model = this.scene.getGlobalAttribute(ATTR_MODEL);
        this.ball = <PIXICmp.Sprite>this.scene.findFirstObjectByTag(TAG_BALL);
        this.paddle = <PIXICmp.Sprite>this.scene.findFirstObjectByTag(TAG_PADDLE);

        if (this.model.currentRound == 0) {
            // init the first round
            this.gotoNextRound();
        }
    }

    onMessage(msg: Msg) {
        if (msg.action == MSG_COMMAND_GAME_OVER) {
            this.gameOver();
        } else if (msg.action == MSG_COMMAND_FINISH_LEVEL) {
            this.finishLevel();
        } else if (msg.action == MSG_COMMAND_GOTO_NEXT_ROUND) {
            this.gotoNextRound();
        }
    }

    protected gameOver() {
        this.model.currentLevel = 0;
        this.sendMessage(MSG_GAME_OVER);
        this.ball.remove();
        this.reset();
    }

    protected finishLevel() {
        // go to the next level
        if (this.model.currentLevel == this.model.maxLevel) {
            this.model.currentLevel = 0; // back to intro scene
            this.sendMessage(MSG_GAME_COMPLETED);
        } else {
            this.model.currentLevel++;
            // slightly increase ball speed
            this.model.ballSpeed *= this.model.ballSpeedMultiplier;
            this.sendMessage(MSG_LEVEL_COMPLETED);
        }
        this.ball.remove();
        this.reset();
    }


    protected gotoNextRound() {
        let dynamics = <Dynamics>this.ball.getAttribute(ATTR_DYNAMICS);
        this.model.currentRound++;
        dynamics.velocity.x = 0;
        dynamics.velocity.y = 0;
        this.model.ballReleased = false;

        // set the position of the ball to touch the paddle
        this.ball.position.x = this.paddle.position.x + this.model.ballOffset;
        this.ball.position.y = 22.4;

        if (this.model.currentRound == 1) {
            this.sendMessage(MSG_LEVEL_STARTED);
        } else {
            this.sendMessage(MSG_ROUND_STARTED);
        }
    }

    private reset() {
        this.scene.invokeWithDelay(3000, () => this.factory.resetGame(this.scene, this.model));
    }
}