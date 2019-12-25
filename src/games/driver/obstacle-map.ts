import * as ECSA from '../../../libs/pixi-component';
import { LINES_NUM, Attributes } from './constants';

/**
 * Structure that stores obstacles (traffic)
 */
export default class ObstacleMap {

  count: number;
  obstacles: Map<number, ECSA.GameObject>;
  forbiddenLane1: number;
  forbiddenLane2: number;
  lastForbiddenSwitchTime1: number;
  lastForbiddenSwitchTime2: number;

  constructor() {
    this.count = 0; // current number of obstacles
    this.obstacles = new Map(); // obstacles mapped by their id

    // these parameters works as follows:
    // there must be at least one lane free
    // when switching to another free lane, there must be a delay long enough
    // for the player to move to the new lane safely
    // -> when switching to a new lane, there would be two forbidden lanes at a time before the delay ends
    this.forbiddenLane1 = Math.floor(Math.random() * LINES_NUM);
    this.forbiddenLane2 = this.forbiddenLane1;
    this.lastForbiddenSwitchTime1 = 0;
    this.lastForbiddenSwitchTime2 = 0;
  }

  // gets map with obstacles, mapped by their ids
  getObstacles(): Map<number, ECSA.GameObject> {
    return this.obstacles;
  }

  // adds a new obstacle
  addObstacle(gameObject: ECSA.GameObject, gameTime: number) {
    this.obstacles.set(gameObject.id, gameObject);

    // check whether it is time to switch to a new lane
    if (gameTime - this.lastForbiddenSwitchTime1 >= 10000) {
      // for now there shouldn't be any new obstacle on two lanes
      this.forbiddenLane2 = this.forbiddenLane1;
      this.forbiddenLane1 = Math.floor(Math.random() * LINES_NUM);
      this.lastForbiddenSwitchTime2 = gameTime;
      this.lastForbiddenSwitchTime1 = gameTime;

    }

    // check whether the delay has ended and therefore we can forbide only one lane
    if (gameTime - this.lastForbiddenSwitchTime2 >= 5000 && this.forbiddenLane2 !== this.forbiddenLane1) {
      this.forbiddenLane2 = this.forbiddenLane1;
      this.lastForbiddenSwitchTime2 = gameTime;
      this.lastForbiddenSwitchTime1 = gameTime;
    }

    this.count++;
  }

  // removes an existing obstacle
  removeObstacle(gameObject: ECSA.GameObject) {
    this.obstacles.delete(gameObject.id);
    this.count--;
  }

  isPlaceFreeForObstacle(topPos: number, bottomPos: number, lane: number) {
    if (lane === this.forbiddenLane1 || lane === this.forbiddenLane2) {
      return false;
    }

    for (let [, val] of this.obstacles) {
      if (val.getAttribute(Attributes.LINE) !== lane) {
        continue;
      }

      let posY = val.getAttribute<number>(Attributes.ROAD_POS_Y);

      let bounds = val.pixiObj.getBounds();
      let obstacleTopPos = posY;
      let obstacleBottomPos = posY - bounds.height;
      // 20 pixels tolerance
      let intersection = Math.min(topPos, obstacleTopPos) - Math.max(bottomPos, obstacleBottomPos);
      if (intersection >= -20) {
        return false;
      }
    }

    return true;
  }

  // finds an obstacle that is in collision with given object
  findCollidedObstacle(gameObject: ECSA.GameObject) {
    for (let [, val] of this.obstacles) {
      if (this._intersects(gameObject, val, 5)) { // 20px tolerance
        return val;
      }
    }
    return null;
  }

  // gets obstacle that is closest to given object
  getNearestObstacle(gameObject: ECSA.GameObject, sameLane: boolean = true): ECSA.GameObject {
    let lane = gameObject.getAttribute(Attributes.LINE);
    let nearest = null;
    let nearestDistance = 0;
    let gameObjectPosY = gameObject.getAttribute<number>(Attributes.ROAD_POS_Y);

    for (let [, val] of this.obstacles) {
      if (sameLane && val.getAttribute(Attributes.LINE) !== lane) {
        continue;
      }
      let posY = val.getAttribute<number>(Attributes.ROAD_POS_Y);
      let distance = (posY - val.pixiObj.getBounds().height) - gameObjectPosY;
      if (distance > 0) {
        if (nearest == null || distance < nearestDistance) {
          nearest = val;
          nearestDistance = distance;
        }
      }
    }
    return nearest;
  }

  // return true, if the given line is forbidden
  isLaneForbidden(lane: number) {
    return (lane === this.forbiddenLane1 || lane === this.forbiddenLane2);
  }

  _intersects(obj1: ECSA.GameObject, obj2: ECSA.GameObject, tolerance: number = 0) {
    return this._horizontalIntersection(obj1, obj2) >= -tolerance && this._verticalIntersection(obj1, obj2) >= -tolerance;
  }

  _horizontalIntersection(obj1: ECSA.GameObject, obj2: ECSA.GameObject) {
    let boundsA = obj1.pixiObj.getBounds();
    let boundsB = obj2.pixiObj.getBounds();
    return Math.min(boundsA.x + boundsA.width, boundsB.x + boundsB.width) - Math.max(boundsA.x, boundsB.x);
  }

  _verticalIntersection(obj1: ECSA.GameObject, obj2: ECSA.GameObject) {
    let boundsA = obj1.pixiObj.getBounds();
    let boundsB = obj2.pixiObj.getBounds();
    return Math.min(boundsA.y + boundsA.height, boundsB.y + boundsB.height) - Math.max(boundsA.y, boundsB.y);
  }
}
