import * as ECSA from '../../../libs/pixi-component';
import { Factory } from './factory';
import { Model } from './model';
import { Messages, Attributes, Names } from './constants';
import Dynamics from '../../utils/dynamics';

/**
 * Component that orchestrates main logic of the game
 */
export class GameComponent extends ECSA.Component {
  private model: Model;
  private factory: Factory;

  private paddle: ECSA.Sprite;
  private ball: ECSA.Sprite;

  onInit() {
    this.subscribe(Messages.CMD_GAME_OVER, Messages.CMD_GOTO_NEXT_ROUND, Messages.CMD_FINISH_LEVEL);

    this.factory = this.scene.getGlobalAttribute(Attributes.FACTORY);
    this.model = this.scene.getGlobalAttribute(Attributes.MODEL);
    this.ball = <ECSA.Sprite>this.scene.findObjectByName(Names.BALL);
    this.paddle = <ECSA.Sprite>this.scene.findObjectByName(Names.PADDLE);

    if (this.model.currentRound === 0) {
      // init the first round
      this.gotoNextRound();
    }
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === Messages.CMD_GAME_OVER) {
      this.gameOver();
    } else if (msg.action === Messages.CMD_FINISH_LEVEL) {
      this.finishLevel();
    } else if (msg.action === Messages.CMD_GOTO_NEXT_ROUND) {
      this.gotoNextRound();
    }
  }

  protected gameOver() {
    this.model.currentLevel = 0;
    this.sendMessage(Messages.GAME_OVER);
    this.ball.remove();
    this.reset();
  }

  protected finishLevel() {
    // go to the next level
    if (this.model.currentLevel === this.model.maxLevel) {
      this.model.currentLevel = 0; // back to intro scene
      this.sendMessage(Messages.GAME_COMPLETED);
    } else {
      this.model.currentLevel++;
      // slightly increase ball speed
      this.model.ballSpeed *= this.model.ballSpeedMultiplier;
      this.sendMessage(Messages.LEVEL_COMPLETED);
    }
    this.ball.remove();
    this.reset();
  }


  protected gotoNextRound() {
    let dynamics = this.ball.getAttribute<Dynamics>(Attributes.DYNAMICS);
    this.model.currentRound++;
    dynamics.velocity = new ECSA.Vector(0, 0);
    this.model.ballReleased = false;

    // set the position of the ball to touch the paddle
    this.ball.position.x = this.paddle.position.x + this.model.ballOffset;
    this.ball.position.y = 22.4; // can be hardcoded, the scene is scaled to be of size 25

    if (this.model.currentRound === 1) {
      this.sendMessage(Messages.LEVEL_STARTED);
    } else {
      this.sendMessage(Messages.ROUND_STARTED);
    }
  }

  private reset() {
    this.scene.invokeWithDelay(3000, () => this.factory.resetGame(this.scene, this.model));
  }
}