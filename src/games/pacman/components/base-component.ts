import * as ECSA from '../../../../libs/pixi-component';
import { Attributes } from '../constants';
import PacmanModel from '../pacman-model';
import SpriteData from '../sprite-data';
import PacmanFactory from '../pacman-factory';

/**
 * Base class for all Pacman components, loads shared attributes
 */
export default class BaseComponent extends ECSA.Component {

  protected model: PacmanModel;
  protected factory: PacmanFactory;
  protected spriteSheetData: {
    [key: string]: SpriteData;
  };

  onInit() {
    this.model = this.scene.getGlobalAttribute(Attributes.MODEL);
    this.spriteSheetData = this.scene.getGlobalAttribute(Attributes.SPRITESHEET_DATA);
    this.factory = this.scene.getGlobalAttribute(Attributes.FACTORY);
  }
}