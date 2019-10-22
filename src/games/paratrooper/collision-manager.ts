import * as ECSA from '../../../libs/pixi-component';
import * as PIXI from 'pixi.js';
import { BFlags, Messages, States } from './constants';
import { ParatrooperBaseCmp } from './paratrooper-base-component';

/**
 * Entity that keeps info about collisions
 */
export class CollisionInfo {
  // hit unit
  unit: ECSA.GameObject;
  // projectile that has hit the unit
  projectile: ECSA.GameObject;

  constructor(unit: ECSA.GameObject, projectile: ECSA.GameObject) {
    this.unit = unit;
    this.projectile = projectile;
  }
}

/**
 * Simple collision manager
 */
export class CollisionManager extends ParatrooperBaseCmp {
  units = new Array<ECSA.GameObject>();
  projectiles = new Array<ECSA.GameObject>();

  onInit() {
    super.onInit();
    this.subscribe(ECSA.Messages.OBJECT_ADDED, ECSA.Messages.OBJECT_REMOVED);
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === ECSA.Messages.OBJECT_ADDED || msg.action === ECSA.Messages.OBJECT_REMOVED) {
      // refresh collections.. could be done faster if we checked new objects and listened to Messages.FLAG_CHANGED events
      this.projectiles = this.scene.findObjectsByFlag(BFlags.PROJECTILE);
      this.units = this.scene.findObjectsByFlag(BFlags.COLLIDABLE);
    }
  }

  onUpdate(delta: number, absolute: number) {
    let collides = new Array<CollisionInfo>();

    // O(m^n), yet we don't suppose there will be more than 50 units in total
    for (let projectile of this.projectiles) {
      if (projectile.stateId !== States.DEAD) {
        for (let unit of this.units) {
          if (unit.stateId !== States.DEAD) {
            let boundsA = projectile.pixiObj.getBounds();
            let boundsB = unit.pixiObj.getBounds();

            let intersectionX = this.testHorizIntersection(boundsA, boundsB);
            let intersectionY = this.testVertIntersection(boundsA, boundsB);

            if (intersectionX > 0 && intersectionY > 0) {
              // we have a collision
              collides.push(new CollisionInfo(unit, projectile));
            }
          }
        }
      }
    }

    // send message for all colliding objects
    for (let collid of collides) {
      this.sendMessage(Messages.COLLISION_TRIGGERED, collid);
    }
  }

  /**
   * Checks horizontal intersection
   */
  private testHorizIntersection(boundsA: PIXI.Rectangle, boundsB: PIXI.Rectangle): number {
    return Math.min(boundsA.right, boundsB.right) - Math.max(boundsA.left, boundsB.left);
  }

  /**
   * Checks vertical intersection
   */
  private testVertIntersection(boundsA: PIXI.Rectangle, boundsB: PIXI.Rectangle): number {
    return Math.min(boundsA.bottom, boundsB.bottom) - Math.max(boundsA.top, boundsB.top);
  }
}