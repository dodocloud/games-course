import { Point } from 'pixi.js';
import DynamicsComponent from '../../utils/dynamics-component';
import { Attributes } from './constants';

/**
 * Movement logic for projectile
 */
export class ProjectileComponent extends DynamicsComponent {

  constructor() {
    super(Attributes.DYNAMICS);
  }

  onUpdate(delta: number, absolute: number) {
    super.onUpdate(delta, absolute);

    // check boundaries
    let globalPos = this.owner.pixiObj.toGlobal(new Point(0, 0));
    if (globalPos.x < 0 || globalPos.x > this.scene.app.screen.width || globalPos.y < 0 || globalPos.y > this.scene.app.screen.height) {
      this.owner.remove();
    }
  }
}