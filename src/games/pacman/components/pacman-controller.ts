import * as ECSA from '../../../../libs/pixi-component';
import { Attributes, Messages, UnitState, SpecFunctions, GameState } from '../constants';
import { GameUnit } from '../game-unit';
import { mapToWorld } from '../utils';
import PacmanWalkAnim from './pacman-walk-anim';
import BaseComponent from './base-component';
import { Direction } from '../direction';
import SpriteAnimator from './sprite-animator';

export class PacmanController extends BaseComponent {

  private currentWalkAnim: PacmanWalkAnim;

  get unit() {
    return this.owner.getAttribute(Attributes.GAME_UNIT) as GameUnit;
  }

  onInit() {
    super.onInit();
    this.subscribe(Messages.PACMAN_KILLED, Messages.VICTORY, Messages.PACMAN_REVIVED);
  }

  onMessage(msg: ECSA.Message) {
    if(msg.action === Messages.PACMAN_KILLED) {
      if(this.currentWalkAnim) {
        this.currentWalkAnim.finish();
        this.currentWalkAnim = null;
      }
      this.owner.addComponent(new SpriteAnimator(this.spriteSheetData.pacman_death,
        this.spriteSheetData.pacman_death.frames * (200 / this.model.gameSpeed), false));
    } else if (msg.action === Messages.VICTORY) {
      if(this.currentWalkAnim) {
        this.currentWalkAnim.finish();
        this.currentWalkAnim = null;
      }
      this.owner.addComponent(new SpriteAnimator(this.spriteSheetData.pacman_win,
        this.spriteSheetData.pacman_win.frames * (500 / this.model.gameSpeed), false));
    } else if(msg.action === Messages.PACMAN_REVIVED) {
      let spriteInfo = this.spriteSheetData.pacman_walk_left;
      this.owner.asSprite().texture.frame = new PIXI.Rectangle(spriteInfo.x, spriteInfo.y, spriteInfo.w, spriteInfo.h);
    }
  }


  protected followDirection(direction: Direction): boolean {

    if(this.unit.state !== UnitState.STANDING || (this.model.state !== GameState.DEFAULT && this.model.state !== GameState.RUSH_MODE)) {
      return false;
    }

    let x = this.unit.pos.x;
    let y = this.unit.pos.y;

    switch(direction) {
      case Direction.LEFT:
        if(!this.unit.canGoLeft()) {
          return false;
        }
        x--;
        break;
      case Direction.RIGHT:
        if(!this.unit.canGoRight()) {
          return false;
        }
        x++;
        break;
      case Direction.UP:
        if(!this.unit.canGoUp()) {
          return false;
        }
        y--;
        break;
      case Direction.DOWN:
        if(!this.unit.canGoDown()) {
          return false;
        }
        y++;
        break;
    }

    let newPos = new ECSA.Vector(x, y);
    this.unit.state = UnitState.WALKING;
    this.unit.dir = direction;
    // execute walk anim
    if(this.currentWalkAnim) {
      this.currentWalkAnim.finish();
      this.currentWalkAnim = null;
    }
    this.owner.addComponent(new ECSA.ChainComponent()
      .execute(() => this.currentWalkAnim = new PacmanWalkAnim(this.unit.pos, direction, this.model.isSomethingEatable(newPos), 150))
      .addComponentAndWait(() => this.currentWalkAnim)
      .execute(() => {
        if(this.unit.state === UnitState.WALKING) {
          this.confirmPositionChange(direction);

          // check tunnel
          if(this.unit.pos.equals(this.model.easternTunnelPos)) {
            this.unit.pos = this.model.westernTunnelPos.clone();
            this.followDirection(Direction.LEFT);
          } else if(this.unit.pos.equals(this.model.westernTunnelPos)) {
            this.unit.pos = this.model.easternTunnelPos.clone();
            this.followDirection(Direction.DOWN);
          }

          if(this.isRunning) {
            this.onUpdate(0, 0); // parameters are not used here
          }
        }
      }), true);
  }

  private confirmPositionChange(direction: Direction) {
        // confirm position change
        this.unit.state = UnitState.STANDING;
        this.unit.dir = direction;
        this.unit.makeStep();
        let pos = mapToWorld(this.unit.pos.x, this.unit.pos.y);
        this.owner.pixiObj.position.set(pos.x, pos.y);

        let func = this.model.map.getTile(this.unit.pos.x, this.unit.pos.y).specialFunction;
        if(func === SpecFunctions.PELLET) {
          if(this.model.eatPellet(this.unit.pos)) {
            this.sendMessage(Messages.BONUS_TAKEN, this.unit.pos);
          }
        } else if(func === SpecFunctions.PACDOT) {
          // todo check if the pacdot hasn't been eaten already
          if(this.model.eatPacDot(this.unit.pos)) {
            this.sendMessage(Messages.PACDOT_EATEN, this.unit.pos);
          }
        }

        if(this.model.keyPos.x === this.unit.pos.x && this.model.keyPos.y === this.unit.pos.y) {
          this.model.fetchKey();
          this.sendMessage(Messages.KEY_FETCHED);
        }
  }
}

export class PacmanKeyController extends PacmanController {
  onUpdate(delta: number, absolute: number) {
    // get a global component
    let cmp = this.scene.stage.findComponentByName<ECSA.KeyInputComponent>(ECSA.KeyInputComponent.name);
    let cmpKey = <ECSA.KeyInputComponent><any>cmp;
    let state = this.unit.state;

    if(state === UnitState.STANDING) {
      if (cmpKey.isKeyPressed(ECSA.Keys.KEY_LEFT)) {
        this.followDirection(Direction.LEFT);
      } else if (cmpKey.isKeyPressed(ECSA.Keys.KEY_RIGHT)) {
        this.followDirection(Direction.RIGHT);
      } else if (cmpKey.isKeyPressed(ECSA.Keys.KEY_UP)) {
        this.followDirection(Direction.UP);
      } else if (cmpKey.isKeyPressed(ECSA.Keys.KEY_DOWN)) {
        this.followDirection(Direction.DOWN);
      }
    }
  }
}