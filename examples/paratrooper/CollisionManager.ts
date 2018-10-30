import Component from "../../ts/engine/Component";
import * as PIXI from 'pixi.js';
import { PIXICmp } from "../../ts/engine/PIXIObject";
import { MSG_OBJECT_REMOVED, MSG_OBJECT_ADDED, } from '../../ts/engine/Constants';
import Msg from '../../ts/engine/Msg';
import { FLAG_PROJECTILE, STATE_DEAD, MSG_COLLISION, FLAG_COLLIDABLE } from './constants';


export class CollisionTrigger {
    unit: PIXICmp.ComponentObject;
    projectile: PIXICmp.ComponentObject;

    constructor(unit: PIXICmp.ComponentObject, projectile: PIXICmp.ComponentObject) {
        this.unit = unit;
        this.projectile = projectile;
    }
}

export class CollisionManager extends Component {
    units = new Array<PIXICmp.ComponentObject>();
    projectiles = new Array<PIXICmp.ComponentObject>();

    onInit() {
        this.subscribe(MSG_OBJECT_ADDED);
        this.subscribe(MSG_OBJECT_REMOVED);
    }

    onMessage(msg: Msg) {
        if (msg.action == MSG_OBJECT_ADDED || msg.action == MSG_OBJECT_REMOVED) {
            this.projectiles = this.scene.findAllObjectsByFlag(FLAG_PROJECTILE);
            this.units = this.scene.findAllObjectsByFlag(FLAG_COLLIDABLE);
        }
    }

    onUpdate(delta, absolute) {
        let collides = new Array<CollisionTrigger>();

        // O(m^n), we don't suppose there will be more than 50 units in total
        for (let projectile of this.projectiles) {
            if (projectile.getState() != STATE_DEAD) {
                for (let unit of this.units) {
                    if (unit.getState() != STATE_DEAD) {
                        let boundsA = projectile.getPixiObj().getBounds();
                        let boundsB = unit.getPixiObj().getBounds();

                        let intersectionX = Math.min(boundsA.right, boundsB.right) - Math.max(boundsA.left, boundsB.right);
                        let intersectionY = Math.min(boundsA.bottom, boundsB.bottom) - Math.max(boundsA.top, boundsB.top);

                        if (intersectionX > 0 && intersectionY > 0) {
                            collides.push(new CollisionTrigger(unit, projectile));
                        }
                    }
                }
            }
        }

        for (let collid of collides) {
            this.sendMessage(MSG_COLLISION, collid);
        }
    }
}