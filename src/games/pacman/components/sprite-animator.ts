import BaseComponent from './base-component';
import SpriteData from '../sprite-data';

/**
 * Simple component for sprite animations
 */
export default class SpriteAnimator extends BaseComponent {

  private duration: number;
  private spriteData: SpriteData;
  private timeSoFar: number;
  private infinite: boolean;
  private inverted: boolean;

  constructor(spriteData: any, duration: number, infinite: boolean, inverted: boolean = false) {
    super();
    this.spriteData = spriteData;
    this.duration = duration;
    this.infinite = infinite;
    this.inverted = inverted;
    this.spriteData.frames_per_row = this.spriteData.frames_per_row || this.spriteData.frames;
  }

  onInit() {
    super.onInit();
    this.timeSoFar = 0;
  }

  /**
   * Inverts the animation back to the beginning
   */
  invert() {
    this.inverted = !this.inverted;
    this.timeSoFar = this.duration - this.timeSoFar;
  }

  onUpdate(delta: number, absolute: number) {
    let texture = (this.owner.pixiObj as PIXI.Sprite).texture;
    let frames = this.spriteData.frames;

    this.timeSoFar = Math.min(this.duration, this.timeSoFar + delta);

    let frameIndex = Math.floor((this.timeSoFar / this.duration) * (frames - 1));

    if (this.inverted) {
      frameIndex = frames - frameIndex - 1;
    }

    texture.frame = new PIXI.Rectangle(this.spriteData.x + this.spriteData.w * (frameIndex % this.spriteData.frames_per_row),
      this.spriteData.y + this.spriteData.h * Math.floor(frameIndex / this.spriteData.frames_per_row), this.spriteData.w, this.spriteData.h);

    if (this.timeSoFar >= this.duration) {
      if (!this.infinite) {
        this.finish();
      } else {
        this.timeSoFar = 0; // back to the beginning
      }
    }
  }
}