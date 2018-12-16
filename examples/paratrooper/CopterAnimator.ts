import { TEXTURE_COPTER_LEFT, TEXTURE_COPTER_RIGHT } from './Constants';
import Component from "../../ts/engine/Component";
import Vec2 from '../../ts/utils/Vec2';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import Msg from '../../ts/engine/Msg';
import { ParatrooperBaseCmp } from './ParatrooperBaseCmp';
import { ATTR_DYNAMICS } from '../../ts/engine/Constants';
import Dynamics from '../../ts/utils/Dynamics';

/**
 * Component that only changes sprite according to the direction of attached copter
 */
export class CopterAnimator extends ParatrooperBaseCmp {
    lastVelocity = new Vec2(0, 0);

    onUpdate(delta: number, absolute: number) {
        let dynamics = this.owner.getAttribute<Dynamics>(ATTR_DYNAMICS);
        let velocity = dynamics.velocity;

        if (Math.sign(velocity.x) != Math.sign(this.lastVelocity.x) || this.lastVelocity.x == 0) {
            if (velocity.x < 0) {
                // to the left
                let sprite = <PIXICmp.Sprite>this.owner.getPixiObj();
                sprite.texture = PIXI.Texture.fromImage(TEXTURE_COPTER_LEFT);
            } else {
                // to the right
                let sprite = <PIXICmp.Sprite>this.owner.getPixiObj();
                sprite.texture = PIXI.Texture.fromImage(TEXTURE_COPTER_RIGHT);
            }
        }
    }
}