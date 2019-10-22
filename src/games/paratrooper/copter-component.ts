import { Names, Messages } from './constants';
import { ParatrooperBaseCmp } from './paratrooper-base-component';
import { checkTime } from '../../utils/functions';

/**
 * Simple logic for copters
 */
export class CopterComponent extends ParatrooperBaseCmp {

  onInit() {
    super.onInit();
    this.frequency = this.model.paratrooperSpawnFrequency;
  }

  onUpdate(delta: number, absolute: number) {
    // copter bounding box
    let bbox = this.owner.pixiObj.getBounds();

    // 65% prob at each step
    if (Math.random() > 0.35) {
      let tower = this.scene.findObjectByName(Names.TOWER);
      let towerBB = tower.pixiObj.getBounds();

      // don't drop paratrooper above the tower
      if (bbox.left > 0 && bbox.right < this.scene.app.screen.width && (bbox.right < towerBB.left || bbox.left > towerBB.right)) {
        this.frequency /= 1.1; // drop next paratroopers with lower frequency
        this.factory.createParatrooper(this.owner, this.model);
      }
    }
  }
}