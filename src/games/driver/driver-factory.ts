import { Assets, Attributes } from './constants';
import * as ECSA from '../../../libs/pixi-component';
import { DriverModel } from './driver-model';
import SpriteManager from './sprite-manager';
import ObstacleMap from './obstacle-map';
import { SpritesData } from './sprite-data';
import GameComponent from './modelcomponents/game-component';
import ObstacleManager from './modelcomponents/obstacle-manager';
import RoadRenderer from './viewcomponents/road-renderer';
import RoadObjectRenderer from './viewcomponents/road-object-renderer';
import CarCollisionChecker from './modelcomponents/car-collision-checker';
import ScoreDisplayComponent from './viewcomponents/score-display-component';
import SpeedbarComponent from './viewcomponents/speedbar-component';
import LivesComponent from './viewcomponents/lives-component';
import { CarTouchController } from './modelcomponents/car-controller';
import AnimTextDisplayComponent from './viewcomponents/anim-text-display-component';
import SpriteData from '../pacman/sprite-data';
import MovingObstacleComponent from './modelcomponents/moving-obstacle-component';

export default class DriverFactory {
  private spritesData: SpritesData;
  private spriteSheet: PIXI.BaseTexture;

  constructor(spritesData: SpritesData) {
    this.spritesData = spritesData;
    this.spriteSheet = PIXI.BaseTexture.from(Assets.SPRITESHEET);
  }

  initializeLevel(scene: ECSA.Scene, model: DriverModel) {
    scene.clearScene();

    scene.assignGlobalAttribute(Attributes.GAME_MODEL, model);
    scene.assignGlobalAttribute(Attributes.FACTORY, this);
    scene.assignGlobalAttribute(Attributes.SPRITE_MGR, new SpriteManager(this.spritesData));
    scene.assignGlobalAttribute(Attributes.OBSTACLE_MAP, new ObstacleMap());
    scene.assignGlobalAttribute(Attributes.SPRITESHEET, this.spriteSheet);
    scene.addGlobalComponent(new ECSA.PointerInputComponent(true));
    scene.addGlobalComponent(new GameComponent());

    let builder = new ECSA.Builder(scene);

    builder
      .withComponent(new RoadRenderer())
      .asContainer('road')
      .withParent(scene.stage)
      .build();

    builder
    .withAttribute(Attributes.LINE, 1)
    .withAttribute(Attributes.SPEED, model.currentMaxSpeed)
    .withComponent(new CarCollisionChecker())
    .withComponent(new GameComponent())
    .withComponent(new CarTouchController())
    .anchor(0.5)
    .virtualAnchor(0.5, 1.0)
    .relativePos(0.5, 0.9)
    .asSprite(this.createTexture(this.spritesData.car), 'car')
    .withParent(scene.stage)
    .build();

    builder
      .withComponent(new ScoreDisplayComponent())
      .relativePos(0.1, 0.1)
      .asText('score', '', new PIXI.TextStyle({
        fontFamily: 'Adventure',
        fontSize: 36,
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
      })).withParent(scene.stage).build();

    builder
      .withComponent(new ObstacleManager())
      .asContainer('obstacle_manager')
      .withParent(scene.stage)
      .build();

    builder
      .withComponent(new SpeedbarComponent())
      .virtualAnchor(1, 0)
      .relativePos(0.8, 0.1)
      .asSprite(this.createTexture(this.spritesData.bar_cover), 'speedbar')
      .withParent(scene.stage)
      .build();

    // number of lives (only view)
    let lives = builder
      .asContainer('lives')
      .withParent(scene.stage)
      .build();
    lives.addComponent(new LivesComponent(), true);
  }

  public displayText(scene: ECSA.Scene, text: string, duration: number) {
    new ECSA.Builder(scene)
    .withComponent(new AnimTextDisplayComponent(text, duration))
    .relativePos(0.5, 0.5)
    .anchor(0.5, 0.5)
    .asText('anim_text', text, new PIXI.TextStyle({
      fontFamily: 'Adventure',
      fontSize: 40,
      fill: ['#ffffff'],
    })).withParent(scene.stage).build();
  }

    // creates a new obstacle
  public createNewObstacle(scene: ECSA.Scene, sprite: SpriteData, posX: number, posY: number, lane: number, speed: number, isMoving: boolean): ECSA.GameObject {
    let builder = new ECSA.Builder(scene);
    if(isMoving) {
      builder.withComponent(new MovingObstacleComponent());
    }
    builder.globalPos(posX, posY);
    builder.anchor(0.5, 0);
    builder.withAttribute(Attributes.LINE, lane);
    builder.withAttribute(Attributes.ROAD_POS_Y, posY);
    builder.withAttribute(Attributes.SPEED, speed);
    builder.withComponent(new RoadObjectRenderer()).asSprite(this.createTexture(sprite), 'obstacle').withParent(scene.stage);
    return builder.build();
  }

  private createTexture(spriteInfo: any): PIXI.Texture {
    let texture = new PIXI.Texture(this.spriteSheet);
    texture.frame = new PIXI.Rectangle(spriteInfo.x, spriteInfo.y, spriteInfo.w, spriteInfo.h);
    return texture;
  }
}