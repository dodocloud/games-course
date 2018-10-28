import { LANES_NUM, ATTR_LANE } from './constants';
import { DEFAULT_LIVES, DEFAULT_MAX_SPEED, DEFAULT_TRAFFIC_FREQUENCY } from './cardriver';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { SpritesData, SpriteInfo } from './sprites';

/**
 * Main game model
 */
export class GameModel {
	cameraPosition = 0; // position of the camera
	cameraSpeed = 0; // speed of the camera (by default the same as the speed of the car)
	lives = DEFAULT_LIVES; // current number of lives
	score = 0; // current score
	immuneMode = false; // indicator for immune mode (when the car collides with anything)
	currentMaxSpeed = DEFAULT_MAX_SPEED; // current max speed the car is able to achieve
	trafficFrequency = DEFAULT_TRAFFIC_FREQUENCY; // current traffic frequency [1, MAXIMUM_FREQUENCY]
}

/**
 * Sprite sheet wrapper
 */
export class SpriteManager {
	sprites: SpritesData;

	constructor(sprites) {
		this.sprites = sprites;
	}

	// gets width of the background sprite
	getBgrWidth() : number {
		return this.sprites.bgr_left[0].width;
	}

	// gets left background sprite
	getLeftBgr(index) : SpriteInfo {
		return this.sprites.bgr_left[index];
	}

	// gets right background sprite
	getRightBgr(index) : SpriteInfo {
		return this.sprites.bgr_right[index];
	}

	// gets road sprite
	getRoad(): SpriteInfo {
		return this.sprites.road;
	}

	// gets player's car sprite
	getCar(): SpriteInfo {
		return this.sprites.car;
	}

	// gets player's car sprite when it is destroyed
	getCarDestroyed(): SpriteInfo {
		return this.sprites.car_destroyed;
	}

	// gets life sprite
	getLife(): SpriteInfo {
		return this.sprites.life;
	}

	// gets border of the speedbar
	getBarCover(): SpriteInfo {
		return this.sprites.bar_cover;
	}

	// gets inner sprite of the speedbar
	getBarFill(): SpriteInfo {
		return this.sprites.bar_fill;
	}

	// gets obstacle by type and index
	getObstacle(type, index = 0) : SpriteInfo{
		let counter = 0;

		for (let obstacle of this.sprites.obstacles) {
			if (obstacle.type == type && counter++ == index) {
				return obstacle;
			}
		}

		return null;
	}

	// gets coordinates of the center of given lane
	getCenterOfLane(laneIndex): number {
		if (laneIndex == 0) {
			// the first line starts 10 pixels from the left
			return this.getCenterOfLane(1) - (this.sprites.road.width - (2 * 10)) / 3;
		}

		if (laneIndex == 1) {
			return this.sprites.road.width / 2;
		}

		if (laneIndex == 2) {
			return this.getCenterOfLane(1) + (this.sprites.road.width - (2 * 10)) / 3;
		}
	}

}

/**
 * Structure that stores obstacles (traffic)
 */
export class ObstacleMap {
	count = 0; // current number of obstacles
	obstacles = new Map<number, PIXICmp.ComponentObject>(); // obstacles mapped by their id

	// these parameters works as follows:
	// there must be at least one lane free
	// when switching to another free lane, there must be a delay long enough
	// for the player to move to the new lane safely
	// -> when switching to a new lane, there would be two forbidden lanes at a time before the delay ends
	forbiddenLane1 = Math.floor(Math.random() * LANES_NUM);
	forbiddenLane2 = this.forbiddenLane1;
	lastForbiddenSwitchTime1 = 0;
	lastForbiddenSwitchTime2 = 0;

	// gets map with obstacles, mapped by their ids
	getObstacles(): Map<number, PIXICmp.ComponentObject> {
		return this.obstacles;
	}

	// adds a new obstacle
	addObstacle(gameObject: PIXICmp.ComponentObject, gameTime: number) {
		this.obstacles.set(gameObject.proxy.id, gameObject);
		let lane = gameObject.getAttribute(ATTR_LANE);

		// check whether it is time to switch to a new lane
		if (gameTime - this.lastForbiddenSwitchTime1 >= 10000) {
			// for now there shouldn't be any new obstacle on two lanes
			this.forbiddenLane2 = this.forbiddenLane1;
			this.forbiddenLane1 = Math.floor(Math.random() * LANES_NUM);
			this.lastForbiddenSwitchTime2 = gameTime;
			this.lastForbiddenSwitchTime1 = gameTime;

		}

		// check whether the delay has ended and therefore we can forbide only one lane
		if (gameTime - this.lastForbiddenSwitchTime2 >= 5000 && this.forbiddenLane2 != this.forbiddenLane1) {
			this.forbiddenLane2 = this.forbiddenLane1;
			this.lastForbiddenSwitchTime2 = gameTime;
			this.lastForbiddenSwitchTime1 = gameTime;
		}

		this.count++;
	}

	// removes an existing obstacle
	removeObstacle(gameObject) {
		this.obstacles.delete(gameObject.id);
		this.count--;
	}

	/**
	 * @file All generic attributes the whole scene is working with
	 * @param topPos top coordinate
	 * @param bottomPos bottom coordinate
	 * @param lane lane index
	 */
	isPlaceFreeForObstacle(topPos, bottomPos, lane) {
		if (lane == this.forbiddenLane1 || lane == this.forbiddenLane2) {
			return false;
		}

		for (let [key, val] of this.obstacles) {
			if (val.getAttribute(ATTR_LANE) != lane) {
				continue;
			}

			let obstacleTopPos = val.getPixiObj().position.y;
			let obstacleBottomPos = val.getPixiObj().position.y - val.getPixiObj().height;
			// 20 pixels tolerance
			let intersection = -Math.max(obstacleBottomPos - 20, bottomPos) + Math.min(obstacleTopPos + 20, topPos);

			if (intersection >= 0) {
				return false;
			}
		}

		return true;
	}

	// finds an obstacle that is in collision with given object
	findCollidedObstacle(gameObject) {
		for (let [key, val] of this.obstacles) {


			if (this._intersects(gameObject, val, 5)) { // 20px tolerance
				return val;
			}
		}
		return null;
	}

	// gets obstacle that is closest to given object
	getNearestObstacle(gameObject, sameLane = true) {
		let lane = gameObject.getAttribute(ATTR_LANE);
		let nearest = null;
		let nearestDistance = 0;

		for (let [key, val] of this.obstacles) {
			if (sameLane && val.getAttribute(ATTR_LANE) != lane) {
				continue;
			}

			let distance = (val.getPixiObj().position.y - val.getPixiObj().height) - gameObject.trans.posY;
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
	isLaneForbidden(lane) {
		return (lane == this.forbiddenLane1 || lane == this.forbiddenLane2);
	}

	_intersects(obj1, obj2, tolerance = 0) {
		return this._horizontalIntersection(obj1, obj2) >= -tolerance && this._verticalIntersection(obj1, obj2) >= -tolerance;
	}

	_horizontalIntersection(obj1, obj2) {
		return Math.min(obj1.trans.posX + obj1.sprite.width, obj2.trans.posX + obj2.sprite.width) - Math.max(obj1.trans.posX, obj2.trans.posX);
	}

	_verticalIntersection(obj1, obj2) {
		return Math.min(obj1.trans.posY + obj1.sprite.height, obj2.trans.posY + obj2.sprite.height) - Math.max(obj1.trans.posY, obj2.trans.posY);
	}
}
