import { Messages } from './../constants';
import BaseComponent from '../base-component';

// component that plays a flickering animation
// used when the game switches to the immune mode
export default class FlickerAnimation extends BaseComponent {

  duration: number;
  frequency: number;
  lastFlicker: number;
  startTime: number;

  constructor(duration: number) {
    super();
    this.duration = duration;
  }

  onInit() {
    super.onInit();
    this.frequency = 10;
    this.lastFlicker = 0;
    this.startTime = 0;
  }

  onUpdate(delta: number, absolute: number) {
    if (this.lastFlicker === 0) {
      this.lastFlicker = absolute;
    }

    if (this.startTime === 0) {
      this.startTime = absolute;
    }

    if ((absolute - this.lastFlicker) > (1000 / this.frequency)) {
      // blink
      this.lastFlicker = absolute;
      this.owner.pixiObj.alpha = 1 - this.owner.pixiObj.alpha;
    }

    if ((absolute - this.startTime) > this.duration) {
      // finish
      this.owner.pixiObj.alpha = 1;
      this.sendMessage(Messages.ANIM_ENDED);
      this.owner.removeComponent(this);
    }
  }
}
