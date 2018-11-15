import { MSG_UNIT_KILLED, ATTR_FACTORY, TAG_COPTER, MSG_COPTER_CREATED } from './constants';
import Msg from '../../ts/engine/Msg';
import { checkTime } from './Utils';
import { ParatrooperBaseCmp } from './ParatrooperBaseCmp';

/**
 * Global component responsible for creating new copters
 */
export class CopterSpawner extends ParatrooperBaseCmp {
    lastSpawnTime = 0;
    spawnFrequency = 0;

    onInit() {
        super.onInit();
        this.subscribe(MSG_UNIT_KILLED);
        this.spawnFrequency = this.model.copterSpawnFrequency;
    }

    onMessage(msg: Msg) {
        if (msg.action == MSG_UNIT_KILLED && msg.gameObject.proxy.tag == TAG_COPTER) {
            // sync number of copters on the scene
            this.model.coptersCreated--;
        }
    }

    onUpdate(delta, absolute) {
        if (checkTime(this.lastSpawnTime, absolute, this.spawnFrequency)) {
            // create a new copter and speed up spawn frequency
            this.model.coptersCreated++;
            this.lastSpawnTime = absolute;
            this.spawnFrequency *= 1.02;
            this.factory.createCopter(this.owner, this.model);
            this.sendMessage(MSG_COPTER_CREATED);
        }
    }
}