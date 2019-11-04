import * as ECSA from '../../../libs/pixi-component';
import { Names, Attributes } from './constants';
import { Model } from './model';
import Dynamics from '../../utils/dynamics';

const PADDLE_POS_MIN = 1;
const PADDLE_POS_MAX = 20;

/**
 * Controller for paddle
 */
class PaddleController extends ECSA.Component {
  private _ball: ECSA.Sprite;
  private model: Model;
  // if true, paddle is heading left
  private leftDirection = false;
  private paddleLastPos = 0;

  onInit() {
    this.model = this.scene.getGlobalAttribute(Attributes.MODEL);
  }

  get ball() {
    if(!this._ball) {
      this._ball = <ECSA.Sprite>this.scene.findObjectByName(Names.BALL);
    }
    return this._ball;
  }

  /**
   * Moves the paddle either to the left or right
   */
  move(left: boolean, delta: number) {
    if (left) {
      this.owner.pixiObj.position.x -= this.model.paddleSpeed * delta;
    } else {
      this.owner.pixiObj.position.x += this.model.paddleSpeed * delta;
    }

    // check boundaries
    this.owner.pixiObj.position.x = Math.max(Math.min(this.owner.pixiObj.position.x, PADDLE_POS_MAX), PADDLE_POS_MIN);
    this.leftDirection = (this.owner.pixiObj.position.x - this.paddleLastPos) < 0;
    this.paddleLastPos = this.owner.pixiObj.position.x;

    // move ball along with the paddle
    if (!this.model.ballReleased) {
      this.ball.position.x = this.owner.pixiObj.position.x + this.model.ballOffset;
    }
  }

  releaseBall() {
    if (!this.model.ballReleased) {
      this.model.ballReleased = true;

      // set the velocity
      let dynamics = this.ball.getAttribute<Dynamics>(Attributes.DYNAMICS);
      let x = (this.paddleLastPos === 0 ? 0 : this.leftDirection ? -this.model.ballInitSpeed : this.model.ballInitSpeed) * this.model.ballSpeed;
      let y = -this.model.ballSpeed;
      dynamics.velocity = new ECSA.Vector(x, y);
    }
  }
}

/**
 * Keyboard controller for paddle
 */
export class PaddleInputController extends PaddleController {
  onUpdate(delta: number, absolute: number) {

    // get a global component
    let cmp = this.scene.stage.findComponentByName<ECSA.KeyInputComponent>(ECSA.KeyInputComponent.name);

    if (cmp.isKeyPressed(ECSA.Keys.KEY_LEFT)) {
      this.move(true, delta);
    }

    if (cmp.isKeyPressed(ECSA.Keys.KEY_RIGHT)) {
      this.move(false, delta);
    }

    if (cmp.isKeyPressed(ECSA.Keys.KEY_UP)) {
      this.releaseBall();
    }
  }
}