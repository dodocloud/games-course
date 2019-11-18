import * as ECSA from '../../../../libs/pixi-component';
import { Messages, UnitState, GameState } from '../constants';
import { Direction } from '../direction';
import BaseComponent from './base-component';

export default class ProximityChecker extends BaseComponent {

  onInit() {
    super.onInit();
  }

  onMessage(msg: ECSA.Message) {

  }

  onUpdate(delta: number, absolute: number) {
    if(this.model.pacman.state !== UnitState.DEAD
      && (this.model.state === GameState.DEFAULT || this.model.state === GameState.RUSH_MODE)) {
      this.checkProximity();
    }
  }

  private checkProximity() {
    // check proximity with pacman
    let pacmanPos = this.model.pacman.pos;
    let spiders = this.model.spiders;
    for(let [,spider] of spiders) {
      let spiderPos = spider.pos;
      let distance = pacmanPos.subtract(spiderPos);
      if(Math.abs(distance.x) <= 1 && Math.abs(distance.y) <= 1) {
        let collision = false;
        // proximity
        if(Math.abs(distance.x) <= 0 && Math.abs(distance.y) <= 0) {
          collision = true;
        }

        if(Math.abs(distance.y) === 0 && distance.x === -1 && spider.dir === Direction.LEFT && (this.model.pacman.state === UnitState.STANDING || this.model.pacman.dir === Direction.RIGHT)) {
          collision = true;
        }
        if(Math.abs(distance.y) === 0 && distance.x === 1 && spider.dir === Direction.RIGHT && (this.model.pacman.state === UnitState.STANDING || this.model.pacman.dir === Direction.LEFT)) {
          collision = true;
        }
        if(Math.abs(distance.x) === 0 && distance.y === -1 && spider.dir === Direction.UP && (this.model.pacman.state === UnitState.STANDING || this.model.pacman.dir === Direction.DOWN)) {
          collision = true;
        }
        if(Math.abs(distance.x) === 0 && distance.y === 1 && spider.dir === Direction.DOWN && (this.model.pacman.state === UnitState.STANDING || this.model.pacman.dir === Direction.UP)) {
          collision = true;
        }

        if(collision) {
          // send message but don't care about what will happen
          this.sendMessage(Messages.PACMAN_SPIDER_COLLISION, spider);
        }
      }
    }
  }
}