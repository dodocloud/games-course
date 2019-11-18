import * as ECSA from '../../../../libs/pixi-component';
import { GameUnit } from '../game-unit';
import { Attributes, Messages, UnitState } from '../constants';
import SpiderWalkAnim from './spider-walk-anim';
import { Direction } from '../direction';
import BaseComponent from './base-component';

export default class SpiderController extends BaseComponent {

  unit: GameUnit;
  hasDirection = false;

  onInit() {
    super.onInit();
    this.unit = this.owner.getAttribute(Attributes.GAME_UNIT);
    this.subscribe(Messages.VICTORY, Messages.DEFEAT, Messages.PACMAN_KILLED);
  }

  onMessage(msg: ECSA.Message) {
    // this should be game controller's responsibility. However, this is way simpler
    // spiders will disappear upon game state change
    if (msg.action === Messages.VICTORY || msg.action === Messages.DEFEAT || msg.action === Messages.PACMAN_KILLED) {
      this.model.killSpider(this.unit);
      this.owner.remove();
    }
  }

  onUpdate(delta: number, absolute: number) {
    this.walk();
  }

  private walk() {
    if (!this.hasDirection) {
      let newDirection: Direction = null;

      let pathToPacman = this.model.map.search(this.unit.pos, this.model.pacman.pos);
      if (pathToPacman) {
        newDirection = pathToPacman[0];
      } else if (this.unit.canMakeStep()) {
        // proceed
        newDirection = this.unit.dir;
      } else {
        let possibleDirs = this.unit.getWalkableDirections();
        newDirection = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
      }


      if (newDirection != null) {
        this.hasDirection = true;
        this.unit.state = UnitState.WALKING;
        this.owner.addComponent(new ECSA.ChainComponent()
          .addComponentAndWait(() => { return new SpiderWalkAnim(this.unit.pos, newDirection, 500); })
          .execute(() => {
            this.unit.state = UnitState.STANDING;
            this.hasDirection = false;
            this.unit.dir = newDirection;
            this.unit.makeStep();
          }));
      }
    }
  }
}