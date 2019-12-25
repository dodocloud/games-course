import * as ECSA from '../../../libs/pixi-component';
import { Attributes } from './constants';
import ObstacleMap from './obstacle-map';
import SpriteManager from './sprite-manager';
import { DriverModel } from './driver-model';
import DriverFactory from './driver-factory';

export default class BaseComponent extends ECSA.Component {

  protected gameModel: DriverModel;
  protected spriteMgr: SpriteManager;
  protected obstacleMap: ObstacleMap;
  protected factory: DriverFactory;

  onInit() {
    this.factory = this.scene.getGlobalAttribute(Attributes.FACTORY);
    this.gameModel = this.scene.getGlobalAttribute(Attributes.GAME_MODEL);
    this.spriteMgr = this.scene.getGlobalAttribute(Attributes.SPRITE_MGR);
    this.obstacleMap = this.scene.getGlobalAttribute(Attributes.OBSTACLE_MAP);
  }
}