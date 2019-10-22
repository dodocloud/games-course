import { Vector, Sprite } from '../../../libs/pixi-component';
import { Assets, Attributes } from './constants';
import { ParatrooperBaseCmp } from './paratrooper-base-component';
import Dynamics from '../../utils/dynamics';

/**
 * Component that only changes sprite according to the direction of attached copter
 */
export class CopterAnimator extends ParatrooperBaseCmp {
  lastVelocity = new Vector(0, 0);

  onUpdate(delta: number, absolute: number) {
    let dynamics = this.owner.getAttribute<Dynamics>(Attributes.DYNAMICS);
    let velocity = dynamics.velocity;

    if (Math.sign(velocity.x) !== Math.sign(this.lastVelocity.x) || this.lastVelocity.x === 0) {
      if (velocity.x < 0) {
        // to the left
        let sprite = <Sprite>this.owner.pixiObj;
        sprite.texture = PIXI.Texture.from(Assets.TEX_COPTER_LEFT);
      } else {
        // to the right
        let sprite = <Sprite>this.owner.pixiObj;
        sprite.texture = PIXI.Texture.from(Assets.TEX_COPTER_RIGHT);
      }
    }
  }
}