import BaseComponent from '../base-component';
import { Attributes } from '../constants';

// renderer for cars and obstacles
export default class RoadObjectRenderer extends BaseComponent {


  onUpdate(delta: number, absolute: number) {
    let sprite = this.owner.asSprite();
    let cameraPosition = this.gameModel.cameraPosition;

    sprite.position.y = cameraPosition - this.owner.getAttribute<number>(Attributes.ROAD_POS_Y);
  }
}
