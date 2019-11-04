import * as ECSA from '../../../libs/pixi-component';
import { Model } from './model';
import { Messages, Attributes } from './constants';

/**
 * Watcher for lost lives
 */
export class LifeLostWatcher extends ECSA.Component {

  private model: Model;

  onInit() {
    this.subscribe(Messages.BALL_OUTSIDE_AREA);
    this.model = this.scene.getGlobalAttribute(Attributes.MODEL);
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === Messages.BALL_OUTSIDE_AREA) {
      this.resolveBallOutsideArea();
    }
  }

  protected resolveBallOutsideArea() {
    this.model.currentLives--;
    this.sendMessage(Messages.LIFE_LOST);

    if (this.model.currentLives === 0) {
      // game over -> pass messages to the game manager
      this.sendMessage(Messages.CMD_GAME_OVER);
    } else {
      this.sendMessage(Messages.CMD_GOTO_NEXT_ROUND);
    }
  }
}