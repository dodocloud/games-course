import * as ECSA from '../../../../libs/pixi-component';
import { Messages } from '../constants';
import BaseComponent from './base-component';
import { getPacdotIdentifier, getPelletIdentifier } from '../utils';

/**
 * Removes objects from the scene due changes in the model
 */
export default class ItemCollector extends BaseComponent {

  onInit() {
    super.onInit();
    this.subscribe(Messages.PACDOT_EATEN, Messages.BONUS_TAKEN);
  }

  onMessage(msg: ECSA.Message) {
    if(msg.action === Messages.PACDOT_EATEN) {
      let which = msg.data as ECSA.Vector;
      let pacdot = this.scene.findObjectByName(getPacdotIdentifier(which));
      pacdot.remove();
    }

    if(msg.action === Messages.BONUS_TAKEN) {
      let which = msg.data as ECSA.Vector;
      let bonus = this.scene.findObjectByName(getPelletIdentifier(which));
      bonus.remove();
    }
  }
}