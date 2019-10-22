import * as ECSA from '../../../libs/pixi-component';
import { Messages, Names, States } from './constants';
import { ParatrooperBaseCmp } from './paratrooper-base-component';

/**
 * Manager that orchestrates the game in general
 */
export class GameManager extends ParatrooperBaseCmp {

  onInit() {
    super.onInit();
    this.subscribe(Messages.UNIT_LANDED);
  }

  onMessage(msg: ECSA.Message) {
    if (this.model.isGameOver) {
      return;
    }

    if (msg.action === Messages.PROJECTILE_FIRED) {
      // decrease score with each shot
      this.model.score = Math.max(0, this.model.score - this.model.shootPenalty);
    } else if (msg.action === Messages.UNIT_LANDED) {
      // check number of landed units
      this.model.landedUnits++;
      if (this.model.landedUnits >= this.model.maxLandedUnits) {
        // GAME MOVER
        this.gameOver();
      }
    }
  }

  protected gameOver() {
    // display title
    let gameOverObj = this.scene.findObjectByName(Names.GAMEOVER);
    gameOverObj.pixiObj.visible = true;
    this.model.isGameOver = true;

    // find all paratroopers and set their state to CAPTURING. This will execute
    // the capturing animation
    let paratroopers = this.scene.findObjectsByName(Names.PARATROOPER);

    for (let para of paratroopers) {
      if (para.stateId === States.ON_THE_GROUND) {
        para.stateId = States.CAPTURING_BASE;
      }
    }

    // notify everyone interested
    this.sendMessage(Messages.GAME_OVER);
    // wait 5 seconds and reset the game
    this.scene.invokeWithDelay(5000, () => {
      this.factory.resetGame(this.scene);
    });
  }
}