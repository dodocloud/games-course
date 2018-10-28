
import Component from '../../ts/engine/Component';
import { GameModel, SpriteManager, ObstacleMap } from './attributes';
import { ATTR_GAME_MODEL, ATTR_LANE, ATTR_OBSTACLE_MAP, STEERING_NONE, ATTR_SPRITE_MGR, STEERING_LEFT, STEERING_RIGHT, 
	MSG_CAR_COLLIDED, MSG_IMMUNE_MODE_STARTED, MSG_IMMUNE_MODE_ENDED, ATTR_SPEED, LANES_NUM } from './constants';
import { MAXIMUM_FREQUENCY, MAXIMUM_SPEED, STEERING_DURATION } from './cardriver';
import { AnimTextDisplayComponent, RoadObjectRenderer, FlickerAnimation } from './viewcomponents';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { MSG_OBJECT_REMOVED } from '../../ts/engine/Constants';
import { perlin2, simplex2 } from './perlinnoise';
import {MSG_TOUCH} from '../../ts/components/InputManager';


// component that orchestrates global game events
export class GameComponent extends Component {
	gameModel: GameModel;
	car: PIXICmp.ComponentObject;
	spriteMgr: SpriteManager;

	onInit() {
		this.gameModel = this.scene.getGlobalAttribute(ATTR_GAME_MODEL);

		// display animation at the start
		this.owner.addComponent(new AnimTextDisplayComponent("Get ready", 5000));
		this.car = this.scene.findFirstObjectByTag("car");
		this.spriteMgr = this.scene.getGlobalAttribute(ATTR_SPRITE_MGR);
		this.subscribe(MSG_CAR_COLLIDED); // subscribe for messages
	}

	onMessage(msg) {
		if (msg.action == MSG_CAR_COLLIDED) {
			// a collision occurred -> decrement number of lives and handle game over if there are no lives left

			this.gameModel.lives--;
			if (this.gameModel.lives == 0) {
				this.owner.addComponent(new AnimTextDisplayComponent("Game Over", 5000));
				// change sprite
				let sprite = <PIXICmp.Sprite>this.car.getPixiObj();
				sprite.texture.frame = this.spriteMgr.getCarDestroyed().toRectangle();

				// wait 4 seconds and refresh the scene
				/*	this.scene.addPendingInvocation(4000, () => {
						this.scene.clearScene();
						initGame();
					});*/

			} else {
				// switch to immune mode, wait 4 seconds and disable it
				this.gameModel.immuneMode = true;
				this.sendMessage(MSG_IMMUNE_MODE_STARTED);

				this.scene.invokeWithDelay(4000, () => {
					this.gameModel.immuneMode = false;
					this.sendMessage(MSG_IMMUNE_MODE_ENDED);
				});
			}
		}
	}

	onUpdate(delta, absolute) {
		// increase the traffic slowly
		this.gameModel.trafficFrequency = Math.min(MAXIMUM_FREQUENCY, this.gameModel.trafficFrequency + delta * 0.0001);
		// increase the score
		this.gameModel.score += this.car.getAttribute(ATTR_SPEED) * delta * 0.001;
		// increase maximum speed (it has impact on both player's car and obstacles)
		this.gameModel.currentMaxSpeed = Math.min(MAXIMUM_SPEED, this.gameModel.currentMaxSpeed + delta * 0.0001);
		// by default, speed of the camera will have the same value as the speed of the car
		// however, we can animate the camera independently. That's why there are two attributes
		this.gameModel.cameraSpeed = this.car.getAttribute(ATTR_SPEED);
		this.gameModel.cameraPosition += (this.gameModel.cameraSpeed * delta * 0.01);
	}
}

// component that adds and removes obstacles (other cars, trucks and the real obstacles)
export class ObstacleManager extends Component {
	gameModel: GameModel;
	spriteMgr: SpriteManager;
	obstacleMap: ObstacleMap;

	onInit() {
		this.gameModel = this.scene.getGlobalAttribute(ATTR_GAME_MODEL);
		this.spriteMgr = this.scene.getGlobalAttribute(ATTR_SPRITE_MGR);
		this.obstacleMap = this.scene.getGlobalAttribute(ATTR_OBSTACLE_MAP);
		this.subscribe(MSG_OBJECT_REMOVED); // subscribe for messages
	}

	onMessage(msg) {
		if (msg.action == MSG_OBJECT_REMOVED && msg.gameObject.tag == "obstacle") {
			this.obstacleMap.removeObstacle(msg.gameObject);
		}
	}

	onUpdate(delta, absolute) {

		this._checkOldObstacles();

		let currentFrequency = this.gameModel.trafficFrequency / MAXIMUM_FREQUENCY;

		// use simplex noise for better random distribution
		if (!this.gameModel.immuneMode && (simplex2(1, this.gameModel.cameraPosition) + 1) / 2 > (1 - currentFrequency)) {

			// pick an obstacle
			var obstacleIndex = Math.floor(Math.random() * 7);
			var sprite = null;
			// choose a lane
			var lane = Math.floor(Math.random() * LANES_NUM);

			if (!this.obstacleMap.isLaneForbidden(lane)) {
				var speed = 0;
				let isMoving = true;
				let currentMaxSpeed = this.gameModel.currentMaxSpeed;

				// assign sprite and speed (cars are usually faster than trucks)
				if (obstacleIndex == 0) {
					sprite = this.spriteMgr.getObstacle("car", 0);
					speed = this._randomIntFromInterval(currentMaxSpeed * 0.50, currentMaxSpeed * 0.90);
				}
				if (obstacleIndex == 1) {
					sprite = this.spriteMgr.getObstacle("car", 1);
					speed = this._randomIntFromInterval(currentMaxSpeed * 0.50, currentMaxSpeed * 0.85);
				}
				if (obstacleIndex == 2) {
					sprite = this.spriteMgr.getObstacle("car", 2);
					speed = this._randomIntFromInterval(currentMaxSpeed * 0.50, currentMaxSpeed * 0.75);
				}
				if (obstacleIndex == 3) {
					sprite = this.spriteMgr.getObstacle("truck", 0);
					speed = this._randomIntFromInterval(currentMaxSpeed * 0.50, currentMaxSpeed * 0.60);
				}
				if (obstacleIndex == 4) {
					sprite = this.spriteMgr.getObstacle("truck", 1);
					speed = this._randomIntFromInterval(currentMaxSpeed * 0.50, currentMaxSpeed * 0.55);
				}
				if (obstacleIndex == 5) {
					isMoving = false;
					sprite = this.spriteMgr.getObstacle("static");
				}
				if (obstacleIndex == 6) {
					isMoving = false;
					sprite = this.spriteMgr.getObstacle("static", 1);
				}

				// calculate position according to the lane 
				let posX = this.spriteMgr.getBgrWidth() + this.spriteMgr.getCenterOfLane(lane) - sprite.width / 2;
				let posY = this.gameModel.cameraPosition + 200; // place slightly above the canvas

				// check whether the place is free for a new obstacle (we need to check it here as soon as we know specific sprite)
				if (this.obstacleMap.isPlaceFreeForObstacle(posY, posY - sprite.height, lane)) {
					this._createNewObstacle(sprite, posX, posY, lane, speed, isMoving, absolute);
				}
			}
		}
	}

	// checks obstacles that are below the canvas and removes them
	_checkOldObstacles() {
		let cameraPosition = this.gameModel.cameraPosition;
		let obstacles = this.obstacleMap.getObstacles();

		for (let [key, val] of obstacles) {
			if ((cameraPosition - val.getPixiObj().position.y) > 1000) {
				// delete obstacle -> objects are removed when the update
				// is finished, so there is no need to worry about removal during this iteration loop
				val.remove();
			}
		}
	}

	// creates a new obstacle
	_createNewObstacle(sprite, posX, posY, lane, speed, isMoving, absolute) {
		var atlas = PIXI.Texture.fromImage('cardriver.png');
		let texture = atlas.clone();
		texture.frame = sprite.toRectangle();

		let newObj = new PIXICmp.Sprite("obstacle", texture);
		newObj.getPixiObj().position.x = posX;
		newObj.getPixiObj().position.y = posY;
		//newObj.zIndex = 1;
		newObj.addAttribute(ATTR_LANE, lane);
		newObj.addAttribute(ATTR_SPEED, speed);

		if (isMoving) {
			newObj.addComponent(new MovingObstacleComponent()); // add AI component for dynamic obstacles
		}

		newObj.addComponent(new RoadObjectRenderer());
		this.scene.app.stage.addChild(newObj);
		this.obstacleMap.addObstacle(newObj, absolute);
	}

	_randomIntFromInterval(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
}

// A very dummy AI component for moving obstacles (cars and trucks)
export class MovingObstacleComponent extends Component {
	spriteMgr: SpriteManager;
	gameModel: GameModel;
	obstacleMap: ObstacleMap;
	currentAcceleration = 0;
	currentMaxSpeed = 0;

	onInit() {
		this.spriteMgr = this.scene.getGlobalAttribute(ATTR_SPRITE_MGR);
		this.gameModel = this.scene.getGlobalAttribute(ATTR_GAME_MODEL);
		this.obstacleMap = this.scene.getGlobalAttribute(ATTR_OBSTACLE_MAP);
		this.currentAcceleration = 0;
		this.currentMaxSpeed = this.owner.getAttribute(ATTR_SPEED);
	}

	onUpdate(delta, absolute) {
		let currentSpeed = this.owner.getAttribute(ATTR_SPEED);

		// increment position according to the current speed
		this.owner.getPixiObj().position.y += currentSpeed * delta * 0.01;

		// find nearest obstacle on the same lane
		let nearest = this.obstacleMap.getNearestObstacle(this.owner, true);

		if (nearest != null) {

			// check if the obstacle is close enough
			let distance = (nearest.trans.posY - nearest.sprite.height) - this.owner.getPixiObj().position.y;

			// if we are closer than 200 units, we need to decelerate
			let criticalDistance = this.currentMaxSpeed * 3;
			// try to achieve the same velocity no closer than 20 units behind the nearest obstacle
			let desiredDistance = this.currentMaxSpeed;

			if (distance < criticalDistance) {

				// we have to get to the same velocity
				let desiredSpeed = nearest.getAttribute(ATTR_SPEED);

				if (distance < desiredDistance) {
					// very close!! We need to decelerate faster
					desiredSpeed /= 1.3;
				}

				if (desiredSpeed < currentSpeed) {
					// calculate deceleration in order to be on the same speed cca 20 pixels behind the obstacle
					// a = v^2 / 2s
					this.currentAcceleration = -1 * Math.max(0, (currentSpeed - desiredSpeed)
						* (currentSpeed - desiredSpeed) / (2 * Math.max(1, distance - desiredDistance)));
				}
			} else if (currentSpeed < this.currentMaxSpeed) {
				// no obstacle closer than 200 pixels -> we can accelerate to our max speed
				this.currentAcceleration = 0.3;
			} else {
				this.currentAcceleration = 0;
			}
		}

		// modify velocity according to the current acceleration speed
		// use simple Euler integration method (v' = a*t)
		this.owner.addAttribute(ATTR_SPEED, Math.max(0, currentSpeed + this.currentAcceleration * delta * 0.01));

	}
}

// controller for player's car, contains methods that can be invoked from more specific controlers (like CarTouchController)
export class CarController extends Component {
	steeringTime = 0;
	steeringSourcePosX = 0;
	steeringState = 0;
	spriteMgr: SpriteManager;
	gameModel: GameModel;
	desiredVelocity = 0;

	onInit() {
		this.steeringTime = 0; // the time the steering has started
		this.steeringSourcePosX = 0; // initial position when the steering started
		this.steeringState = STEERING_NONE; // initial steering state
		this.spriteMgr = this.scene.getGlobalAttribute(ATTR_SPRITE_MGR);
		this.gameModel = this.scene.getGlobalAttribute(ATTR_GAME_MODEL);

		this.subscribe(MSG_IMMUNE_MODE_STARTED); // subscribe for messages
		this.subscribe(MSG_IMMUNE_MODE_ENDED);

		// set the initial speed
		this.owner.addAttribute(ATTR_SPEED, this.gameModel.currentMaxSpeed);
		this.desiredVelocity = this.gameModel.currentMaxSpeed;
	}

	onMessage(msg) {
		if (msg.action == MSG_IMMUNE_MODE_STARTED) {
			// play the flickering animation and decelerate a little bit
			this.owner.addComponent(new FlickerAnimation(4000));
			this.decelerate(this.gameModel.currentMaxSpeed / 2);
		}

		if (msg.action == MSG_IMMUNE_MODE_ENDED) {
			// accelerate back to the current max speed
			this.accelerate(this.gameModel.currentMaxSpeed);
		}
	}

	// accelerates until it reaches desired velocity
	accelerate(desiredVelocity) {
		this.desiredVelocity = desiredVelocity;
	}

	// decelerates until it reaches desired velocity
	decelerate(desiredVelocity) {
		this.desiredVelocity = desiredVelocity;
	}

	// goes to the left lane
	steerLeft() {
		this.steeringState = STEERING_LEFT;
		this.steeringTime = 0;
		this.steeringSourcePosX = this.owner.getPixiObj().position.x;
		let currentCarLane = this.owner.getAttribute(ATTR_LANE);
		this.owner.addAttribute(ATTR_LANE, currentCarLane - 1); // change the attribute
	}

	// goes to the right line
	steerRight() {
		this.steeringState = STEERING_RIGHT;
		this.steeringTime = 0;
		this.steeringSourcePosX = this.owner.getPixiObj().position.x;
		let currentCarLane = this.owner.getAttribute(ATTR_LANE);
		this.owner.addAttribute(ATTR_LANE, currentCarLane + 1); // change the attribute
	}

	onUpdate(delta, absolute) {
		this._handleSpeed(delta, absolute);
		this._handleSteering(delta, absolute);
	}

	// increments speed and handles acceleration to desired velocity (if differs from current speed)
	_handleSpeed(delta, absolute) {
		let speed = this.owner.getAttribute(ATTR_SPEED);

		// if the maximum speed has increased enough, accelerate to the next velocity level
		if (this.gameModel.currentMaxSpeed > speed * 1.1 && this.desiredVelocity == speed) {
			this.accelerate(this.gameModel.currentMaxSpeed);
		}

		if (this.desiredVelocity != speed) {
			// if the desired velocity differs, we need to either accelerate or decelerate
			// in order to change the current velocity
			if (this.desiredVelocity > speed) {
				speed = Math.min(this.desiredVelocity, speed + 1 * delta * 0.003);
			} else {
				speed = Math.max(this.desiredVelocity, speed + -1 * delta * 0.003);
			}

			// update the attribute
			this.owner.addAttribute(ATTR_SPEED, speed);
		}

		// increment position according to the current speed
		this.owner.getPixiObj().position.y += (speed * delta * 0.01);
	}

	_handleSteering(delta, absolute) {
		let currentCarLane = this.owner.getAttribute(ATTR_LANE);

		if (this.steeringState != STEERING_NONE && this.steeringTime == 0) {
			// steering state has changed -> start the steering procedure
			this.steeringTime = absolute;
		}

		let road = this.spriteMgr.getRoad();
		let bgrWidth = this.spriteMgr.getBgrWidth();

		if (this.steeringState != STEERING_NONE) {

			// handle the steering behavior
			let increment = this.steeringState == STEERING_LEFT ? -1 : 1;
			var desiredLocationX = bgrWidth + this.spriteMgr.getCenterOfLane(currentCarLane) - this.spriteMgr.getCar().width / 2;

			// transform to [0,1] interval
			var progress = Math.min(1, (absolute - this.steeringTime) / STEERING_DURATION);
			// change car location
			this.owner.getPixiObj().position.x = this.steeringSourcePosX + (desiredLocationX - this.steeringSourcePosX) * progress;

			if (progress >= 1) {
				// steering has finished
				this.steeringState = STEERING_NONE;
				this.steeringTime = 0;
			}
		}
	}
}

// component that controls the car according to the mouse or touch events
export class CarTouchController extends CarController {
	onInit() {
		super.onInit();
		this.subscribe(MSG_TOUCH); // subscribe for messages
	}

	onMessage(msg) {
		super.onMessage(msg);
		if (msg.action == MSG_TOUCH) {
			let posX = msg.data.mousePos.posX;
			let posY = msg.data.mousePos.posY;

			let currentCarLane = this.owner.getAttribute(ATTR_LANE);

			if (posX < this.owner.getPixiObj().position.x && currentCarLane > 0) {
				this.steerLeft();
			}

			if (posX > (this.owner.getPixiObj().position.x + this.spriteMgr.getCar().width) && currentCarLane < 2) {
				this.steerRight();
			}
		}
	}
}

// simple collision checker that only notifies other objects that the player's car  
// is in collision with some other object
export class CarCollisionChecker extends Component {
	gameModel: GameModel;
	obstacleMap: ObstacleMap;

	onInit() {
		this.gameModel = this.scene.getGlobalAttribute(ATTR_GAME_MODEL);
		this.obstacleMap = this.scene.getGlobalAttribute(ATTR_OBSTACLE_MAP);
	}

	onUpdate(delta, absolute) {
		if (!this.gameModel.immuneMode) {
			// check for collisions
			let collided = this.obstacleMap.findCollidedObstacle(this.owner);
			if (collided != null) {
				// just send the message
				this.sendMessage(MSG_CAR_COLLIDED);
			}
		}
	}
}
