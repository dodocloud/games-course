import * as ECSA from '../../../../libs/pixi-component';
import BaseComponent from './base-component';
import { GateState } from '../constants';
import SpriteAnimator from './sprite-animator';

export default class GateController extends BaseComponent {

  private gateState: GateState;
  private pendingAnimation: SpriteAnimator = null;

  onInit() {
    super.onInit();
    this.gateState = GateState.CLOSED;
  }

  onUpdate(delta: number, absolute: number) {

    if(this.isAtGate() && (this.gateState === GateState.CLOSED || this.gateState === GateState.CLOSING)) {
      // open the gate
      if(this.gateState === GateState.CLOSED) {
        // fully open
        this.pendingAnimation = new SpriteAnimator(this.spriteSheetData.gate,
          this.spriteSheetData.gate.frames * (500 / this.model.gameSpeed), false, false);

        this.owner.addComponent(new ECSA.ChainComponent()
        .addComponentAndWait(() => this.pendingAnimation)
        .execute(() => this.confirmGateStateChange()), true);
      } else {
        // revert back
        if(this.pendingAnimation && this.pendingAnimation.isRunning) {
          this.pendingAnimation.invert();
        }
      }

      this.gateState = GateState.OPENING;
    }

    if(!this.isAtGate() && (this.gateState === GateState.OPEN || this.gateState === GateState.OPENING)) {
      // close the gate
      if(this.gateState === GateState.OPEN) {
        // fully close
        this.pendingAnimation = new SpriteAnimator(this.spriteSheetData.gate,
          this.spriteSheetData.gate.frames * (500 / this.model.gameSpeed), false, true);

        this.owner.addComponent(new ECSA.ChainComponent()
        .addComponentAndWait(() => this.pendingAnimation)
        .execute(() => this.confirmGateStateChange()), true);
      } else {
        // revert back
        if(this.pendingAnimation && this.pendingAnimation.isRunning) {
          this.pendingAnimation.invert();
        }
      }

      // if it is closing, we will consider it as closed instantly
      this.model.map.getTile(this.model.gatePos.x, this.model.gatePos.y).state = GateState.CLOSED;
      this.gateState = GateState.CLOSING;
    }
  }

  confirmGateStateChange() {
    // update model
    if(this.gateState === GateState.OPENING) {
      this.gateState = GateState.OPEN;
      this.model.map.getTile(this.model.gatePos.x, this.model.gatePos.y).state = GateState.OPEN;
    } else if (this.gateState === GateState.CLOSING) {
      this.gateState = GateState.CLOSED;
      this.model.map.getTile(this.model.gatePos.x, this.model.gatePos.y).state = GateState.CLOSED;
    }
  }

  isAtGate(): boolean {
    // hardcoded -> the gate is walkable vertically, hence 1 tile on y-axis
    return this.model.gatePos.x === this.model.pacman.pos.x && Math.abs(this.model.gatePos.y - this.model.pacman.pos.y) <= 1;
  }
}