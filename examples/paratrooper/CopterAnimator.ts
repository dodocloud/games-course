import { ATTR_DYNAMICS, TEXTURE_COPTER_LEFT, TEXTURE_COPTER_RIGHT } from './constants';
import Component from "../../ts/engine/Component";
import Vec2 from '../../ts/utils/Vec2';
import Dynamics from './Dynamics';
import { PIXICmp } from '../../ts/engine/PIXIObject';

export class CopterAnimator extends Component {
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
                // to the rigt
                let sprite = <PIXICmp.Sprite>this.owner.getPixiObj();
                sprite.texture = PIXI.Texture.fromImage(TEXTURE_COPTER_RIGHT);
            }
        }
    }
}