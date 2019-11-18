import * as ECSA from '../../../../libs/pixi-component';
import { GameModel } from './model';
import { Attributes } from './constants';


/**
 * Component that displays an overall game state
 */
export class WarehouseStateComponent extends ECSA.Component {
  model: GameModel;


  onInit() {
    this.model = this.scene.getGlobalAttribute(Attributes.GAME_MODEL);
    let text = this.owner.asText();
    text.style = new PIXI.TextStyle({
      fill: '0x000000',
      fontStyle: 'bold',
      fontSize: '62pt'
    });
  }

  onUpdate(delta: number, absolute: number) {
    (this.owner.asText()).text = 'IRON: ' +
      this.model.warehouseModel.ironOre + ' \nPETROL: ' + this.model.warehouseModel.petrol
     + '\nBOTS:' + this.model.botsNum;
  }
}