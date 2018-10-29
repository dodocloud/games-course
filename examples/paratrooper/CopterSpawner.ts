import { MSG_UNIT_KILLED, ATTR_FACTORY, TAG_COPTER, MSG_COPTER_CREATED } from './constants';
import { ParatrooperModel } from './ParatrooperModel';
import Component from "../../ts/engine/Component";
import ParatrooperFactory from './ParatroperFactory';
import { ATTR_MODEL } from './constants';
import Msg from '../../ts/engine/Msg';

export class CopterSpawner extends Component {
    lastSpawnTime = 0;
    spawnFrequency = 0;
    model: ParatrooperModel;
    factory: ParatrooperFactory;

    onInit() {
        this.subscribe(MSG_UNIT_KILLED);
        this.model = this.scene.root.getAttribute<ParatrooperModel>(ATTR_MODEL);
        this.spawnFrequency = this.model.copterSpawnFrequency;
        this.factory = this.scene.root.getAttribute<ParatrooperFactory>(ATTR_FACTORY);
    }

    onMessage(msg: Msg) {
        if (msg.action == MSG_UNIT_KILLED && msg.gameObject.proxy.tag == TAG_COPTER) {
            this.model.coptersCreated--;
        }
    }

    onUpdate(delta, absolute) {
        if (this.checkTime(this.lastSpawnTime, absolute, this.spawnFrequency)) {
            this.model.coptersCreated++;
            this.lastSpawnTime = absolute;
            this.spawnFrequency *= 1.02;
            this.factory.createCopter(this.owner, this.model);
            this.sendMessage(MSG_COPTER_CREATED);
        }
    }

    private checkTime(lastTime, time, frequency) {
        return (time - lastTime) > 1000 / frequency;
    }
}