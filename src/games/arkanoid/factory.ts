import * as ECSA from '../../../libs/pixi-component';
import { LifeDisplayComponent } from './life-display-component';
import { BallPhysicsComponent } from './ball-physics-component';
import { GameComponent } from './game-component';
import { Attributes, Names, Assets} from './constants';
import { Model, SpriteInfo } from './model';
import { soundComponent } from './sound-component';
import { BrickCollisionResolver } from './brick-collision-resolver';
import { IntroComponent } from './intro-component';
import { PaddleInputController } from './paddle-component';
import { StatusComponent } from './status-component';
import { LifeLostWatcher } from './life-lost-watcher';
import * as PIXI from 'pixi.js';
import DynamicsComponent from '../../utils/dynamics-component';

export class Factory {

  static globalScale = 1;

  initializeLevel(scene: ECSA.Scene, model: Model) {
    // scale the scene
    if (model.currentLevel === 0) {
      this.addIntro(scene, model);
    } else {
      model.initLevel();

      this.addPanels(scene, model);
      this.addBricks(scene, model);
      this.addPaddle(scene, model);
      this.addLives(scene, model);
      this.addStatus(scene, model);

      scene.addGlobalComponent(soundComponent());
      scene.addGlobalComponent(new BrickCollisionResolver());
      scene.addGlobalComponent(new GameComponent());
      scene.addGlobalComponent(new LifeLostWatcher());
    }
  }

  addIntro(scene: ECSA.Scene, model: Model) {
    let builder = new ECSA.Builder(scene);

    // stage components
    builder
      .withComponent(soundComponent())
      .withComponent(new IntroComponent())
      .buildInto(scene.stage);

    // title
    builder
      .relativePos(0.5, 0.25)
      .anchor(0.5)
      .scale(Factory.globalScale)
      .asSprite(this.createTexture(model.getSpriteInfo(Names.TITLE)), Names.TITLE)
      .withParent(scene.stage)
      .build();

    // ship
    builder
      .relativePos(0.5, 0.75)
      .anchor(0.5, 0.5)
      .scale(Factory.globalScale)
      .withParent(scene.stage)
      .asSprite(this.createTexture(model.getSpriteInfo(Names.SHIP)), Names.SHIP)
      .build();
  }

  addBricks(scene: ECSA.Scene, model: Model) {
    let bricks = new ECSA.Container(Names.BRICKS);
    scene.stage.pixiObj.addChild(bricks);

    for (let [, val] of model.bricks) {
      let spriteIndex = val.type - 1; // 0 is for empty space
      let sprite = new ECSA.Sprite('', this.createTexture(model.getSpriteInfo(Names.BRICKS), spriteIndex));
      sprite.scale.set(Factory.globalScale);

      // 1 unit is height of a brick. Thus, the width is 2 units
      sprite.position.x = val.position.x * 2 + 1;
      sprite.position.y = val.position.y + 1;
      bricks.addChild(sprite);

      // connect sprite with brick object
      model.brickSprites.set(sprite.id, val);
      sprite.scale.set(Factory.globalScale);
    }
  }

  addPanels(scene: ECSA.Scene, model: Model) {
    let builder = new ECSA.Builder(scene);
    builder.scale(Factory.globalScale).withParent(scene.stage).asSprite(this.createTexture(model.getSpriteInfo(Names.LEFT_PANEL)), Names.LEFT_PANEL).build();
    builder.scale(Factory.globalScale).localPos(23, 0).withParent(scene.stage).asSprite(this.createTexture(model.getSpriteInfo(Names.RIGHT_PANEL)), Names.RIGHT_PANEL).build();
    builder.scale(Factory.globalScale).withParent(scene.stage).asSprite(this.createTexture(model.getSpriteInfo(Names.TOP_PANEL)), Names.TOP_PANEL).build();
  }

  addPaddle(scene: ECSA.Scene, model: Model) {
    let builder = new ECSA.Builder(scene);

    // paddle
    builder
    .scale(Factory.globalScale)
    .localPos(10, 23)
    .withComponent(new PaddleInputController())
    .asSprite(this.createTexture(model.getSpriteInfo(Names.PADDLE)), Names.PADDLE)
    .withParent(scene.stage)
    .build();

    // ball
    builder
    .scale(Factory.globalScale)
    .localPos(10 + model.ballOffset, 22.4)
    .withComponent(new DynamicsComponent(Attributes.DYNAMICS))
    .withComponent(new BallPhysicsComponent())
    .withParent(scene.stage)
    .asSprite(this.createTexture(model.getSpriteInfo(Names.BALL)), Names.BALL)
    .build();
  }

  addLives(scene: ECSA.Scene, model: Model) {
    // for each life, create a small icon
    for (let i = 1; i <= model.currentLives; i++) {
      let sprite = new ECSA.Sprite(Names.LIFE + '_' + i, this.createTexture(model.getSpriteInfo(Names.LIFE)));
      scene.stage.pixiObj.addChild(sprite);
      sprite.scale.set(Factory.globalScale, Factory.globalScale);

      // place them to the bottom left
      sprite.position.x = 1 + 2 * (i - 1);
      sprite.position.y = 24;
    }

    scene.stage.addComponent(new LifeDisplayComponent());
  }

  addStatus(scene: ECSA.Scene, model: Model) {
    new ECSA.Builder(scene)
      .scale(Factory.globalScale)
      .localPos(9, 15)
      .withComponent(new StatusComponent())
      .withParent(scene.stage)
      .asBitmapText(Names.STATUS, '', Assets.FONT, 20, 0xFFFFFF)
      .build();
  }

  resetGame(scene: ECSA.Scene, model: Model) {
    scene.clearScene();
    scene.assignGlobalAttribute(Attributes.FACTORY, this);
    scene.assignGlobalAttribute(Attributes.MODEL, model);
    if(PIXI.utils.isMobile.any) {
      // use virtual gamepad
      scene.addGlobalComponent(new ECSA.VirtualGamepadComponent({
        KEY_LEFT: ECSA.Keys.KEY_LEFT,
        KEY_RIGHT: ECSA.Keys.KEY_RIGHT,
        KEY_X: ECSA.Keys.KEY_UP
      }));
    } else {
      scene.addGlobalComponent(new ECSA.KeyInputComponent());
    }
    this.initializeLevel(scene, model);
  }

  // loads texture from SpriteInfo entity
  private createTexture(spriteInfo: SpriteInfo, index: number = 0): PIXI.Texture {
    let texture = PIXI.Texture.from(Assets.TXT_ARKANOID);
    texture = texture.clone();
    texture.frame = new PIXI.Rectangle(spriteInfo.offsetX + spriteInfo.width * index, spriteInfo.offsetY, spriteInfo.width, spriteInfo.height);
    return texture;
  }
}