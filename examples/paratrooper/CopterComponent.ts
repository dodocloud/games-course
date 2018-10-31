import { ATTR_MODEL, ATTR_FACTORY, ATTR_DYNAMICS, TAG_TOWER, MSG_PARATROOPER_CREATED } from './constants';
import Component from "../../ts/engine/Component";
import { ParatrooperModel } from './ParatrooperModel';
import ParatrooperFactory from './ParatroperFactory';
import Dynamics from './Dynamics';
import { checkTime } from './Utils';

export class CopterComponent extends Component {
    lastSpawnTime = 0;
    gameModel: ParatrooperModel;
    spawnFrequency = 0;
    factory: ParatrooperFactory;

    onInit() {
        this.gameModel = this.scene.root.getAttribute<ParatrooperModel>(ATTR_MODEL);
        this.spawnFrequency = this.gameModel.paratrooperSpawnFrequency;
        this.factory = this.scene.root.getAttribute<ParatrooperFactory>(ATTR_FACTORY);
    }

    onUpdate(delta: number, absolute: number) {
        let dynamics = this.owner.getAttribute<Dynamics>(ATTR_DYNAMICS);
        dynamics.update(delta, 1);
        let velocity = dynamics.velocity;

        // calculate delta position 
        let deltaPos = dynamics.calcDelta(delta, 1);
        this.owner.getPixiObj().position.x += deltaPos.x;

        // check boundaries
        let globalPos = this.owner.getPixiObj().toGlobal(new PIXI.Point(0,0));

        if ((velocity.x > 0 && globalPos.x > this.owner.getScene().app.screen.width)
            || (velocity.x < 0 && globalPos.x < -this.owner.getPixiObj().width)) {
            velocity.x = -velocity.x;
        }

        this.tryCreateParatrooper(absolute);
    }

    tryCreateParatrooper(absolute: number) {
        if (checkTime(this.lastSpawnTime, absolute, this.spawnFrequency)) {
            this.lastSpawnTime = absolute;
            let bbox = this.owner.getPixiObj().getBounds();
            let pos = this.owner.getPixiObj().toGlobal(new PIXI.Point(0,0));

            // 65% prob at each step
            if (Math.random() > 0.35) {
                let tower = this.scene.findFirstObjectByTag(TAG_TOWER);
                let towerBB = tower.getPixiObj().getBounds();

                // don't drop paratrooper above the owner
                if (pos.x > this.owner.getPixiObj().width && bbox.right < towerBB.left || pos.x > towerBB.right) {
                    this.spawnFrequency /= 1.1; // drop with lower frequency
                    this.factory.createParatrooper(this.owner, this.gameModel);
                    this.sendMessage(MSG_PARATROOPER_CREATED);
                }
            }
        }
    }
}