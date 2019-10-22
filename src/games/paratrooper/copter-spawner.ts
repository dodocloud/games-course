import * as ECSA from '../../../libs/pixi-component';
import { Messages, Names } from './constants';
import { ParatrooperBaseCmp } from './paratrooper-base-component';
import { checkTime } from '../../utils/functions';

/**
 * Global component responsible for creating new copters
 */
export class CopterSpawner extends ParatrooperBaseCmp {
  lastSpawnTime = 0;
  spawnFrequency = 0;

  onInit() {
    super.onInit();
    this.subscribe(Messages.UNIT_KILLED);
    this.spawnFrequency = this.model.copterSpawnFrequency;
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === Messages.UNIT_KILLED && msg.gameObject.name === Names.COPTER) {
      // sync number of copters on the scene
      this.model.coptersCreated--;
    }
  }

  onUpdate(delta: number, absolute: number) {
    if (checkTime(this.lastSpawnTime, absolute, this.spawnFrequency)) {
      // create a new copter and speed up spawn frequency
      this.model.coptersCreated++;
      this.lastSpawnTime = absolute;
      this.spawnFrequency *= 1.02;
      this.factory.createCopter(this.owner, this.model);
    }
  }
}