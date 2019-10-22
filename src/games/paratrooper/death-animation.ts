import { Messages } from './constants';
import { ParatrooperBaseCmp } from './paratrooper-base-component';
import { checkTime } from '../../utils/functions';

/**
 * Simple flicker animation that only changes the visibility of the object
 */
export class DeathAnimation extends ParatrooperBaseCmp {

  updateCounter = 0;

  onInit() {
    super.onInit();
    this.frequency = 50;
    this.updateCounter = 0;
  }

  onUpdate(delta: number, absolute: number) {
    this.owner.pixiObj.visible = !this.owner.pixiObj.visible;

    if (this.updateCounter++ > 4) {
      this.finish();
    }
  }

  onFinish() {
    this.sendMessage(Messages.ANIM_FINISHED);
  }
}