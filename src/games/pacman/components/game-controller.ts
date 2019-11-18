import * as ECSA from '../../../../libs/pixi-component';
import BaseComponent from './base-component';
import { Messages, GameState, UnitState } from '../constants';
import { GameUnit } from '../game-unit';
import { getSpiderIdentifier } from '../utils';

export default class GameController extends BaseComponent {

  private bonusCountDown = -1;

  onInit() {
    super.onInit();
    this.subscribe(Messages.PACDOT_EATEN, Messages.PACMAN_SPIDER_COLLISION, Messages.BONUS_TAKEN);
  }

  onMessage(msg: ECSA.Message) {
    if(msg.action === Messages.PACDOT_EATEN) {
       if(this.model.allPacdotsEaten) {
        // gameover
        this.model.state = GameState.GAME_OVER;
        this.sendMessage(Messages.VICTORY);
        this.scene.invokeWithDelay(3000, () => {
          this.model.initLevel(this.model.gameSpeed);
          this.factory.initializeLevel(this.scene, this.model);
        });
      }
    } else if(msg.action === Messages.BONUS_TAKEN) {
      this.bonusCountDown = 6000;
    } else if(msg.action === Messages.PACMAN_SPIDER_COLLISION) {
      if(this.model.isRushMode) {
        // kill spider
        this.model.killSpider(<GameUnit> msg.data);
        this.owner.scene.findObjectByTag(getSpiderIdentifier(msg.data.id)).remove();
        this.sendMessage(Messages.SPIDER_KILLED);
      } else {
        // kill pacman and revive him after 3 seconds
        this.model.killPacman();
        if(this.model.livesNum === 0) {
          this.model.state = GameState.GAME_OVER;
          this.sendMessage(Messages.PACMAN_KILLED);
          this.scene.invokeWithDelay(3000, () => {
            this.model.initLevel(this.model.gameSpeed);
            this.factory.initializeLevel(this.scene, this.model);
          });
        } else {
          this.model.state = GameState.LIFE_LOST;
          this.sendMessage(Messages.PACMAN_KILLED);
          this.scene.invokeWithDelay(3000, () => {
            this.model.state = GameState.DEFAULT;
            this.model.pacman.state = UnitState.STANDING;
            this.sendMessage(Messages.PACMAN_REVIVED);
          });
        }
      }
    }
  }

  onUpdate(delta: number, absolute: number) {
    if(this.bonusCountDown !== -1) {
      this.bonusCountDown -= delta;
      if(this.bonusCountDown < 0) {
        this.bonusCountDown = -1;
        if(this.model.state === GameState.RUSH_MODE) {
          this.model.state = GameState.DEFAULT;
        }
      }
    }
  }
}