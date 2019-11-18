import * as ECSA from '../../../../libs/pixi-component';
import { GameModel } from './model';
import { BotFactory } from './bot-factory';
import { Attributes } from './constants';

/**
 * Component for the warehouse - maintains storage
 */
export class WarehouseComponent extends ECSA.Component {
  model: GameModel;
  factory: BotFactory;


  onInit() {
    this.model = this.scene.getGlobalAttribute(Attributes.GAME_MODEL);
    this.factory = this.scene.getGlobalAttribute(Attributes.FACTORY);
  }

  onUpdate(delta: number, absolute: number) {
  }
}