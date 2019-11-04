import * as ECSA from '../../../libs/pixi-component';
import { Attributes, Messages } from './constants';
import { Factory } from './factory';
import { Model } from './model';

/**
 * Component that display an intro scene and jumps to the first level
 */
export class IntroComponent extends ECSA.Component {
  private model: Model;
  private factory: Factory;

  onInit() {
    this.model = this.scene.getGlobalAttribute(Attributes.MODEL);
    this.sendMessage(Messages.GAME_STARTED);
    this.factory = this.scene.getGlobalAttribute(Attributes.FACTORY);

    this.scene.invokeWithDelay(5000, () => {
      this.model.currentLevel = 1; // set the first level and reset the game
      this.factory.resetGame(this.scene, this.model);
    });
  }
}