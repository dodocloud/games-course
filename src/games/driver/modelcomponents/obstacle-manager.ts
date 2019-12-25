import * as ECSA from './../../../../libs/pixi-component';
import BaseComponent from '../base-component';
import { MAXIMUM_FREQUENCY, LINES_NUM, Attributes } from '../constants';
import { PerlinNoise } from '../../../../libs/pixi-math';

// component that adds and removes obstacles (other cars, trucks and the real obstacles)
export default class ObstacleManager extends BaseComponent {

  private noise = new PerlinNoise();

  onInit() {
    super.onInit();
    this.subscribe(ECSA.Messages.OBJECT_REMOVED); // subscribe for messages
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === ECSA.Messages.OBJECT_REMOVED && msg.gameObject.name === 'obstacle') {
      this.obstacleMap.removeObstacle(msg.gameObject);
    }
  }

  onUpdate(delta: number, absolute: number) {

    this._checkOldObstacles();

    let currentFrequency = this.gameModel.trafficFrequency / MAXIMUM_FREQUENCY;
    // use simplex noise for better random distribution
    if (!this.gameModel.immuneMode && (this.noise.rawNoise(100, this.gameModel.cameraPosition) + 1.5) / 2 > (1 - currentFrequency)) {
      // pick an obstacle
      let obstacleIndex = Math.floor(Math.random() * 7);
      let sprite = null;
      // choose a lane
      let lane = Math.floor(Math.random() * LINES_NUM);

      if (!this.obstacleMap.isLaneForbidden(lane)) {
        let speed = 0;
        let isMoving = true;
        let currentMaxSpeed = this.gameModel.currentMaxSpeed;

        // assign sprite and speed (cars are usually faster than trucks)
        if (obstacleIndex === 0) {
          sprite = this.spriteMgr.getObstacle('car', 0);
          speed = this._randomIntFromInterval(currentMaxSpeed * 0.50, currentMaxSpeed * 0.90);
        }
        if (obstacleIndex === 1) {
          sprite = this.spriteMgr.getObstacle('car', 1);
          speed = this._randomIntFromInterval(currentMaxSpeed * 0.50, currentMaxSpeed * 0.85);
        }
        if (obstacleIndex === 2) {
          sprite = this.spriteMgr.getObstacle('car', 2);
          speed = this._randomIntFromInterval(currentMaxSpeed * 0.50, currentMaxSpeed * 0.75);
        }
        if (obstacleIndex === 3) {
          sprite = this.spriteMgr.getObstacle('truck', 0);
          speed = this._randomIntFromInterval(currentMaxSpeed * 0.50, currentMaxSpeed * 0.60);
        }
        if (obstacleIndex === 4) {
          sprite = this.spriteMgr.getObstacle('truck', 1);
          speed = this._randomIntFromInterval(currentMaxSpeed * 0.50, currentMaxSpeed * 0.55);
        }
        if (obstacleIndex === 5) {
          isMoving = false;
          sprite = this.spriteMgr.getObstacle('static');
        }
        if (obstacleIndex === 6) {
          isMoving = false;
          sprite = this.spriteMgr.getObstacle('static', 1);
        }

        // calculate position according to the lane
        let posX = this.spriteMgr.getCenterOfLane(lane, this.scene.app.screen.width);
        let posY = this.gameModel.cameraPosition + 200; // place slightly above the canvas

        // check whether the place is free for a new obstacle (we need to check it here as soon as we know specific sprite)
        if (this.obstacleMap.isPlaceFreeForObstacle(posY, posY - sprite.h, lane)) {
          let newObj = this.factory.createNewObstacle(this.scene, sprite, posX, posY, lane, speed, isMoving);
          this.obstacleMap.addObstacle(newObj, absolute);
        }
      }
    }
  }

  // checks obstacles that are below the canvas and removes them
  _checkOldObstacles() {
    let cameraPosition = this.gameModel.cameraPosition;
    let obstacles = this.obstacleMap.getObstacles();

    for (let [, val] of obstacles) {
      if ((cameraPosition - val.getAttribute<number>(Attributes.ROAD_POS_Y)) > 1000) {
        // delete obstacle -> objects are removed when the update
        // is finished, so there is no need to worry about removal during this iteration loop
        val.remove();
      }
    }
  }


  _randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
