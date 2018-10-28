

import Component from '../../ts/engine/Component';
import DebugComponent from '../../ts/components/DebugComponent';
import Scene from '../../ts/engine/Scene';
import ChainingComponent from '../../ts/components/ChainingComponent';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { GameModel, SpriteManager, ObstacleMap } from './attributes'
import { ATTR_GAME_MODEL, ATTR_LANE, ATTR_OBSTACLE_MAP, ATTR_SPRITE_MGR } from './constants'
import { InputManager, INPUT_TOUCH, INPUT_DOWN } from '../../ts/components/InputManager';
import { RoadRenderer, RoadObjectRenderer, ScoreDisplayComponent, LivesComponent, SpeedbarComponent } from './viewcomponents';
import { CarTouchController, CarCollisionChecker, GameComponent, ObstacleManager } from './modelcomponents';

import { SpritesData } from './sprites'

export const MAXIMUM_SPEED = 50;	// maximum speed
export const MAXIMUM_FREQUENCY = 50;	// maximum frequency

export const DEFAULT_LIVES = 3;	// default number of lives
export const DEFAULT_MAX_SPEED = MAXIMUM_SPEED / 6;	// initial maximum speed the player's car can achieve
export const DEFAULT_TRAFFIC_FREQUENCY = 1;	// initial traffic frequency
export const STEERING_DURATION = 400;			// number of ms the steering of player's car should take


class CarDriver {
	engine: PixiRunner;

	// Start a new game
	constructor() {
		this.engine = new PixiRunner();

		this.engine.init(document.getElementById("gameCanvas") as HTMLCanvasElement, 100);

		PIXI.loader
			.reset()    // necessary for hot reload
			.add('cardriver.png')
			.load(() => this.onAssetsLoaded());
	}

	onAssetsLoaded() {
		var atlas = PIXI.Texture.fromImage('cardriver.png');

		// create global attributes
		let model = new GameModel();
		let spriteMgr = new SpriteManager(new SpritesData())
		let obstacleMap = new ObstacleMap();

		// put global attributes into the scene
		this.engine.scene.addGlobalAttribute(ATTR_GAME_MODEL, model);
		this.engine.scene.addGlobalAttribute(ATTR_SPRITE_MGR, spriteMgr);
		this.engine.scene.addGlobalAttribute(ATTR_OBSTACLE_MAP, obstacleMap);
		this.engine.scene.addGlobalComponent(new DebugComponent(document.getElementById("debugSect")));

		// create game manager (all global components should be put into this object)
		let gameManager = new PIXICmp.Container("game_manager");
		gameManager.addComponent(new InputManager(INPUT_TOUCH | INPUT_DOWN));
		gameManager.addComponent(new RoadRenderer());

		this.engine.app.stage.addChild(gameManager);

		// add player's car
		let carTexture = atlas.clone();
		carTexture.frame = spriteMgr.getCar().toRectangle();
		let car = new PIXICmp.Sprite("car", carTexture);


		car.position.x = spriteMgr.getBgrWidth() + spriteMgr.getCenterOfLane(1) - car.width / 2; // the middle lane
		car.position.y = model.cameraPosition - car.height + 1.5 * spriteMgr.getCar().height; // slightly above the bottom border of the scene
		//car.zIndex = 5;

		car.addComponent(new CarTouchController());	// component which controls the car
		car.addComponent(new RoadObjectRenderer());	// component which renders the car
		car.addComponent(new CarCollisionChecker()); // component which controls collisions
		car.addAttribute(ATTR_LANE, 1); // the middle lane
		this.engine.app.stage.addChild(car);

		// score renderer
		let score = new PIXICmp.Sprite("score");
		//score.zIndex = 10;
		score.addComponent(new ScoreDisplayComponent());
		this.engine.app.stage.addChild(score);

		// obstacle manager
		let obstacleMgr = new PIXICmp.Container("obstacle_manager");
		obstacleMgr.addComponent(new ObstacleManager());
		this.engine.app.stage.addChild(obstacleMgr);

		// speed bar
		let speedbar = new PIXICmp.Sprite("speedbar");
		let sprite = spriteMgr.getBarCover();
		speedbar.position.x = spriteMgr.getBgrWidth() * 2 + spriteMgr.getRoad().width - sprite.width - 20;
		speedbar.position.y = 20;
		//speedbar.zIndex = 10;
		speedbar.addComponent(new SpeedbarComponent());
		this.engine.app.stage.addChild(speedbar);

		// number of lives (only view)
		let livesTexture = atlas.clone();
		livesTexture.frame = spriteMgr.getLife().toRectangle();
		let lives = new PIXICmp.Sprite("lives", livesTexture);
		
		//lives.zIndex = 10;
		lives.addComponent(new LivesComponent());
		this.engine.app.stage.addChild(lives);

		gameManager.addComponent(new GameComponent());
		// the manager also renders messages such as Game Over and Get Ready
		gameManager.position.x = spriteMgr.getBgrWidth() + spriteMgr.getRoad().width / 2;
		gameManager.position.y = this.engine.app.screen.height / 2;

	}
}

new CarDriver();

