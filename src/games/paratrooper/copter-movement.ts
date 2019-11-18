import { ParatrooperModel } from './paratrooper-model';
import { Attributes } from './constants';
import { Vector } from '../../../libs/pixi-component';
import DynamicsComponent from '../../utils/dynamics-component';

/**
 * Simple movement behavior that inverts velocity once the copter reaches boundaries of the scene
 */
export class CopterMovement extends DynamicsComponent {
  model: ParatrooperModel;

  constructor() {
    super(Attributes.DYNAMICS);
  }

  onInit() {
    super.onInit();
    this.model = this.scene.getGlobalAttribute(Attributes.MODEL);
  }

  onUpdate(delta: number, absolute: number) {
    super.onUpdate(delta, absolute);

    let velocity = this.dynamics.velocity;
    // check boundaries
    let globalPos = this.owner.pixiObj.toGlobal(new PIXI.Point(0, 0));

    if ((velocity.x > 0 && globalPos.x > this.owner.scene.app.screen.width)
      || (velocity.x < 0 && globalPos.x < -this.owner.pixiObj.width)) {
      velocity = new Vector(-velocity.x, velocity.y);
    }
  }
}