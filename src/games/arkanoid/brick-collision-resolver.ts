import * as ECSA from '../../../libs/pixi-component';
import { HitInfo } from './hitinfo';
import { Attributes, HitTypes, Messages, BrickTypes } from './constants';
import { Model } from './model';

/**
 * Component that handles collision with bricks
 */
export class BrickCollisionResolver extends ECSA.Component {
  private model: Model;

  onInit() {
    this.subscribe(Messages.OBJECT_HIT);
    this.model = this.owner.scene.getGlobalAttribute(Attributes.MODEL);
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === Messages.OBJECT_HIT) {
      let info = <HitInfo>msg.data;
      if (info.hitType === HitTypes.BRICK) {
        this.resolveBrickHit(info);
      }
    }
  }

  protected resolveBrickHit(info: HitInfo) {
    let brick = this.model.brickSprites.get(info.hitObject.id);
    if (brick.type !== BrickTypes.INDESTRUCTIBLE) {
      // decrement number of bricks
      this.model.remainingBricks--;

      // remove brick from the model
      let position = brick.position;
      this.model.removeBrick(position);
      info.hitObject.remove();

      if (this.model.remainingBricks === 0) {
        // send command message in order to finish the current level
        this.sendMessage(Messages.CMD_FINISH_LEVEL);
      }
    }
  }
}