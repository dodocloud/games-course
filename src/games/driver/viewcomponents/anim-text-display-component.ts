import { Messages } from './../constants';
import BaseComponent from '../base-component';

// component that renders animated text
export default class AnimTextDisplayComponent extends BaseComponent {

  text: string;
  duration: number;
  opacity: number;
  startTime: number;

  constructor(text: string, duration: number) {
    super();
    this.text = text;
    this.duration = duration;
  }

  onInit() {
    super.onInit();
    this.startTime = 0;
    this.opacity = 0;
  }


  onUpdate(delta: number, absolute: number) {
    if (this.startTime === 0) {
      this.startTime = absolute;
    }

    let progress = (absolute - this.startTime) / this.duration;

    // opacity goes from 0 to 1 and back to 0
    if (progress > 0.5) {
      this.owner.pixiObj.alpha = 2 - progress * 2;
    } else {
      this.owner.pixiObj.alpha = progress * 2;
    }

    if ((absolute - this.startTime) > this.duration) {
      // animation ended -> finish
      this.owner.remove();
      this.sendMessage(Messages.ANIM_ENDED);
    }
  }
}