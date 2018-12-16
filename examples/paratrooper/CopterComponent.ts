import { DynamicsComponent } from './../../ts/components/DynamicsComponent';
import { ATTR_MODEL, ATTR_FACTORY, TAG_TOWER, MSG_PARATROOPER_CREATED } from './Constants';
import Component from "../../ts/engine/Component";
import { ParatrooperModel } from './ParatrooperModel';
import ParatrooperFactory from './ParatroperFactory';
import { checkTime } from './Utils';
import { ParatrooperBaseCmp } from './ParatrooperBaseCmp';
import Dynamics from '../../ts/utils/Dynamics';

/**
 * Simple logic for copters
 */
export class CopterComponent extends ParatrooperBaseCmp {
    lastSpawnTime = 0;
    spawnFrequency = 0;

    onInit() {
        super.onInit();
        // store frequency into variable since it's dynamic
        this.spawnFrequency = this.model.paratrooperSpawnFrequency;
    }

    onUpdate(delta: number, absolute: number) {
        // spawn new paratroopers with at certain frequency
        if (checkTime(this.lastSpawnTime, absolute, this.spawnFrequency)) {
            this.lastSpawnTime = absolute;
            // copter bounding box
            let bbox = this.owner.getPixiObj().getBounds();
            
            // 65% prob at each step
            if (Math.random() > 0.35) {
                let tower = this.scene.findFirstObjectByTag(TAG_TOWER);
                let towerBB = tower.getPixiObj().getBounds();

                // don't drop paratrooper above the tower
                if (bbox.left > 0 && bbox.right < this.scene.app.screen.width && (bbox.right < towerBB.left || bbox.left > towerBB.right)) {
                    this.spawnFrequency /= 1.1; // drop next paratroopers with lower frequency
                    this.factory.createParatrooper(this.owner, this.model);
                    this.sendMessage(MSG_PARATROOPER_CREATED);
                }
            }
        }
    }
}