import * as ECSA from '../../../../libs/pixi-component';
import BaseComponent from './base-component';
import { Messages } from '../constants';
import { getLifeIconIdentifier } from '../utils';

/**
 * Component that displays number of lives
 */
export class PacmanLivesComponent extends BaseComponent {

  onInit() {
    super.onInit();
    this.subscribe(Messages.PACMAN_KILLED);
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === Messages.PACMAN_KILLED) {
      let lifeName = getLifeIconIdentifier(this.model.livesNum);
      let life = this.scene.findObjectByName(lifeName);
      life.remove();
    }
  }
}