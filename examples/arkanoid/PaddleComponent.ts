import { KeyInputComponent, KEY_RIGHT } from '../../ts/components/KeyInputComponent';
import { TAG_BALL, ATTR_MODEL } from './Constants';
import { Model } from './Model';
import Component from '../../ts/engine/Component';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import Dynamics from '../../ts/utils/Dynamics';
import { ATTR_DYNAMICS } from './../../ts/engine/Constants';

import { KEY_LEFT, KEY_UP } from '../../ts/components/KeyInputComponent';

const PADDLE_POS_MIN = 1;
const PADDLE_POS_MAX = 20;

/**
 * Controller for paddle
 */
class PaddleController extends Component {
    private ball: PIXICmp.Sprite;
    private model: Model;
    // if true, paddle is heading left
    private leftDirection = false;
    paddleLastPos = 0;

    onInit() {
        this.ball = <PIXICmp.Sprite>this.scene.findFirstObjectByTag(TAG_BALL);
        this.model = this.scene.getGlobalAttribute(ATTR_MODEL);
    }

    /**
     * Moves the paddle either to the left or right 
     */
    move(left: boolean, delta: number) {
        if (left) {
            this.owner.getPixiObj().position.x -= this.model.paddleSpeed * delta;
        } else {
            this.owner.getPixiObj().position.x += this.model.paddleSpeed * delta;
        }

        // check boundaries
        this.owner.getPixiObj().position.x = Math.max(Math.min(this.owner.getPixiObj().position.x, PADDLE_POS_MAX), PADDLE_POS_MIN);
        this.leftDirection = (this.owner.getPixiObj().position.x - this.paddleLastPos) < 0;
        this.paddleLastPos = this.owner.getPixiObj().position.x;

        // move ball along with the paddle
        if (!this.model.ballReleased) {
            this.ball.position.x = this.owner.getPixiObj().position.x + this.model.ballOffset;
        }
    }

    releaseBall() {
        if (!this.model.ballReleased) {
            this.model.ballReleased = true;

            // set the velocity
            let dynamics = <Dynamics>this.ball.getAttribute(ATTR_DYNAMICS);
            dynamics.velocity.x = (this.paddleLastPos == 0 ? 0 : this.leftDirection ? -this.model.ballInitSpeed : this.model.ballInitSpeed) * this.model.ballSpeed;
            dynamics.velocity.y = -this.model.ballSpeed;
        }
    }
}

/**
 * Keyboard controller for paddle
 */
export class PaddleInputController extends PaddleController {
    onUpdate(delta: number, absolute: number) {

        // get a global component
        let cmp = this.scene.stage.findComponentByClass(KeyInputComponent.name);
        let cmpKey = <KeyInputComponent><any>cmp;

        if (cmpKey.isKeyPressed(KEY_LEFT)) {
            this.move(true, delta);
        }

        if (cmpKey.isKeyPressed(KEY_RIGHT)) {
            this.move(false, delta);
        }

        if (cmpKey.isKeyPressed(KEY_UP)) {
            this.releaseBall();
        }
    }
}