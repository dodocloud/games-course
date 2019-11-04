import * as ECSA from '../../../libs/pixi-component';
import { ParatrooperBaseCmp } from './paratrooper-base-component';
import { checkTime } from '../../utils/functions';

const DIRECTION_LEFT = 1;
const DIRECTION_RIGHT = 2;

/**
 * Controller for the cannon
 */
export class CannonController extends ParatrooperBaseCmp {
  protected lastShot = 0;

  rotate(direction: number, delta: number) {
    let pixiObj = this.owner.pixiObj;

    if (direction === DIRECTION_LEFT) {
      pixiObj.rotation -= 0.01 * delta;
    } else {
      pixiObj.rotation += 0.01 * delta;
    }

    // check boundaries
    pixiObj.rotation = Math.max(Math.min(pixiObj.rotation, PIXI.DEG_TO_RAD * this.model.maxCannonAngle), PIXI.DEG_TO_RAD * this.model.minCannonAngle);
  }

  tryFire(absolute: number): boolean {
    if (checkTime(this.lastShot, absolute, this.model.cannonFireRate)) {
      this.lastShot = absolute;
      this.factory.createProjectile(this.owner, this.model);
      return true;
    } else {
      return false;
    }
  }
}

/**
 * Cannon controller for the keyboard
 */
export class CannonInputController extends CannonController {
  onUpdate(delta: number, absolute: number) {
    let cmp = this.scene.stage.findComponentByName<ECSA.KeyInputComponent>(ECSA.KeyInputComponent.name);

    if (cmp.isKeyPressed(ECSA.Keys.KEY_LEFT)) {
      this.rotate(DIRECTION_LEFT, delta);
    }

    if (cmp.isKeyPressed(ECSA.Keys.KEY_RIGHT)) {
      this.rotate(DIRECTION_RIGHT, delta);
    }

    if (cmp.isKeyPressed(ECSA.Keys.KEY_UP)) {
      this.tryFire(absolute);
    }
  }
}