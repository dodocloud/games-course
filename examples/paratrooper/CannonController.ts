import { KeyInputComponent, KEY_LEFT, KEY_RIGHT, KEY_X } from './../../ts/components/InputManager';
import { ATTR_MODEL, ATTR_FACTORY, MSG_PROJECTILE_SHOT } from './constants';
import { ParatrooperModel } from './ParatrooperModel';
import Component from "../../ts/engine/Component";
import ParatrooperFactory from './ParatroperFactory';

const DIRECTION_UP = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 3;
const DIRECTION_RIGHT = 4;

export class CannonController extends Component {
    lastShot = 0;
    gameModel: ParatrooperModel;
    factory: ParatrooperFactory;

    onInit() {
        this.gameModel = this.owner.getScene().root.getAttribute<ParatrooperModel>(ATTR_MODEL);
        this.factory = this.owner.getScene().root.getAttribute<ParatrooperFactory>(ATTR_FACTORY);
    }

    rotate(direction: number, delta: number) {
        let pixiObj = this.owner.getPixiObj();

        if (direction == DIRECTION_LEFT) {
            pixiObj.rotation -= 0.01 * delta;
        } else {
            pixiObj.rotation += 0.01 * delta;
        }

        // check boundaries
        pixiObj.rotation = Math.max(Math.min(pixiObj.rotation, this.gameModel.maxCannonAngle), this.gameModel.minCannonAngle);
    }

    tryFire(absolute: number): boolean {
        if (this.checkTime(this.lastShot, absolute, this.gameModel.cannonFireRate)) {
            this.lastShot = absolute;
            this.factory.createProjectile(this.owner, this.gameModel);
            this.sendMessage(MSG_PROJECTILE_SHOT);
            return true;
        } else {
            return false;
        }
    }

    checkTime(lastTime, time, frequency) {
        return (time - lastTime) > 1000 / frequency;
    }
}


export class CannonInputController extends CannonController {
    onUpdate(delta: number, absolute: number) {
        let cmp = this.scene.root.findComponentByClass(KeyInputComponent.name);
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