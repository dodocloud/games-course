import * as ECSA from '../../../libs/pixi-component';
import { Model } from './model';
import { Messages, Attributes } from './constants';

/**
 * Component that displays number of lives
 */
export class LifeDisplayComponent extends ECSA.Component {
  private model: Model;

  onInit() {
    this.subscribe(Messages.LIFE_LOST);
    this.model = this.scene.getGlobalAttribute(Attributes.MODEL);
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === Messages.LIFE_LOST) {
      // each icon has its own name, according to the life number
      let lifeName = `life_${this.model.currentLives + 1}`; // + 1 , because we have already lost this one
      let life = this.scene.findObjectByName(lifeName);
      life.remove();
    }
  }
}