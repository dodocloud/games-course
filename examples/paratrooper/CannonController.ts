import { KeyInputComponent, KEY_LEFT, KEY_RIGHT, KEY_X } from '../../ts/components/KeyInputComponent';
import { ATTR_MODEL, ATTR_FACTORY, MSG_PROJECTILE_SHOT } from './Constants';
import { checkTime } from './Utils';
import { ParatrooperBaseCmp } from './ParatrooperBaseCmp';

const DIRECTION_LEFT = 1;
const DIRECTION_RIGHT = 2;

/**
 * Controller for the cannon
 */
export class CannonController extends ParatrooperBaseCmp {
    protected lastShot = 0;

    rotate(direction: number, delta: number) {
        let pixiObj = this.owner.getPixiObj();

        if (direction == DIRECTION_LEFT) {
            pixiObj.rotation -= 0.01 * delta;
        } else {
            pixiObj.rotation += 0.01 * delta;
        }

        // check boundaries
        pixiObj.rotation = Math.max(Math.min(pixiObj.rotation, PIXI.DEG_TO_RAD*this.model.maxCannonAngle), PIXI.DEG_TO_RAD*this.model.minCannonAngle);
    }

    tryFire(absolute: number): boolean {
        if (checkTime(this.lastShot, absolute, this.model.cannonFireRate)) {
            this.lastShot = absolute;
            this.factory.createProjectile(this.owner, this.model);
            this.sendMessage(MSG_PROJECTILE_SHOT);
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
        let cmp = this.scene.stage.findComponentByClass(KeyInputComponent.name);
        let cmpKey = <KeyInputComponent><any>cmp;

        if (cmpKey.isKeyPressed(KEY_LEFT)) {
            this.rotate(DIRECTION_LEFT, delta);
        }

        if (cmpKey.isKeyPressed(KEY_RIGHT)) {
            this.rotate(DIRECTION_RIGHT, delta);
        }

        if (cmpKey.isKeyPressed(KEY_X)) {
            this.tryFire(absolute);
        }
    }
}