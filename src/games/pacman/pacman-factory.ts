import ItemCollector from './components/item-collector';
import * as ECSA from '../../../libs/pixi-component';
import PacmanModel from './pacman-model';
import { Assets, Attributes, defaultPositions, Names, SpecFunctions } from './constants';
import SpriteAnimator from './components/sprite-animator';
import { PacmanKeyController } from './components/pacman-controller';
import GateController from './components/gate-controller';
import SpiderSpawner from './components/spider-spawner';
import SpiderController from './components/spider-controller';
import { soundComponent } from './components/sound-component';
import SpriteData from './sprite-data';
import { getPacdotIdentifier, getPelletIdentifier, mapToWorld, getSpiderIdentifier } from './utils';
import GameController from './components/game-controller';
import ProximityChecker from './components/proximity-checker';

export default class PacmanFactory {

  private spritesData: {
    [key: string]: SpriteData
  };
  private spriteSheet: PIXI.BaseTexture;

  constructor(spritesData: any) {
    this.spritesData = spritesData;
    this.spriteSheet = PIXI.BaseTexture.from(Assets.SPRITESHEET);
  }

  initializeLevel(scene: ECSA.Scene, model: PacmanModel) {
    scene.clearScene();
    model.initLevel(2);

    scene.assignGlobalAttribute(Attributes.FACTORY, this);
    scene.assignGlobalAttribute(Attributes.MODEL, model);
    scene.assignGlobalAttribute(Attributes.SPRITESHEET_DATA, this.spritesData);

    scene.addGlobalComponent(new ECSA.KeyInputComponent());
    scene.addGlobalComponent(new ItemCollector());
    scene.addGlobalComponent(new GameController());
    scene.addGlobalComponent(new ProximityChecker());
    scene.addGlobalComponent(soundComponent());

    let builder = new ECSA.Builder(scene);

    // create layers so that we don't have to mess up with Z-indices
    let layerItems = builder.withParent(scene.stage).asContainer(Names.LAYER_ITEMS).build();
    builder.withParent(scene.stage).asContainer(Names.LAYER_CREATURES).build();
    let layerbgr = builder.withParent(scene.stage).asContainer(Names.LAYER_BGR).build();


    // add static elements
    builder
      .globalPos(defaultPositions.river)
      .withComponent(new SpriteAnimator(this.spritesData.river, this.spritesData.river.frames * (100 / model.gameSpeed), true))
      .asSprite(this.createTexture(this.spritesData.river), Names.RIVER)
      .withParent(layerbgr)
      .build();

    builder
      .globalPos(defaultPositions.fountain)
      .withComponent(new SpriteAnimator(this.spritesData.fountain, this.spritesData.fountain.frames * (100 / model.gameSpeed), true))
      .asSprite(this.createTexture(this.spritesData.fountain), Names.FOUNTAIN)
      .withParent(layerbgr)
      .build();

    builder
      .globalPos(defaultPositions.gate)
      .withAttribute(Attributes.SPRITE_DATA, this.spritesData.gate)
      .withComponent(new GateController())
      .asSprite(this.createTexture(this.spritesData.gate), Names.GATE)
      .withParent(layerbgr)
      .build();

    builder
      .globalPos(defaultPositions.spiderSpawner)
      .withComponent(new SpiderSpawner(10))
      .withAttribute(Attributes.SPRITE_DATA, this.spritesData.spider_gate)
      .asSprite(this.createTexture(this.spritesData.spider_gate), Names.SPIDER_GATE)
      .withParent(layerbgr)
      .build();

    builder
    .asSprite(PIXI.Texture.from(Assets.BACKGROUND), Names.BACKGROUND)
    .withParent(layerbgr)
    .build();

    // add dynamic elements
    model.map.getTilesByFunction(SpecFunctions.PACDOT).forEach(pacdot => {
      builder
      .globalPos(mapToWorld(pacdot.pos.x, pacdot.pos.y))
      .asSprite(this.createTexture(this.spritesData.dots), getPacdotIdentifier(pacdot.pos))
      .withParent(layerItems)
      .build();
    });

    model.map.getTilesByFunction(SpecFunctions.PELLET).forEach(pellet => {
      builder
      .globalPos(mapToWorld(pellet.pos.x, pellet.pos.y))
      .withComponent(new SpriteAnimator(this.spritesData.pellets, this.spritesData.pellets.frames * (100 / model.gameSpeed), true))
      .asSprite(this.createTexture(this.spritesData.pellets), getPelletIdentifier(pellet.pos))
      .withParent(layerItems)
      .build();
    });

    // add pacman
    this.spawnPacman(scene, model);
  }

  public spawnPacman(scene: ECSA.Scene, model: PacmanModel): ECSA.GameObject {
    return new ECSA.Builder(scene)
      .withAttribute(Attributes.GAME_UNIT, model.pacman)
      .globalPos(mapToWorld(model.pacman.pos.x, model.pacman.pos.y))
      .withComponent(new PacmanKeyController())
      .asSprite(this.createTexture(this.spritesData.pacman_walk_left), Names.PACMAN)
      .withParent(scene.findObjectByName(Names.LAYER_CREATURES))
      .build();
  }

  public spawnSpider(scene: ECSA.Scene, model: PacmanModel): ECSA.GameObject {
    let spider = model.spawnSpider();
    let builder = new ECSA.Builder(scene);

    let newObj = builder
      .withTag(getSpiderIdentifier(spider.id))
      .withAttribute(Attributes.GAME_UNIT, spider)
      .globalPos(mapToWorld(spider.pos.x, spider.pos.y))
      .withComponent(new SpiderController())
      .asSprite(this.createTexture(this.spritesData.spider_walk_down), Names.SPIDER)
      .withParent(scene.findObjectByName(Names.LAYER_CREATURES))
      .build();
    return newObj;
  }

  private createTexture(spriteInfo: any): PIXI.Texture {
    let texture = new PIXI.Texture(this.spriteSheet);
    texture.frame = new PIXI.Rectangle(spriteInfo.x, spriteInfo.y, spriteInfo.w, spriteInfo.h);
    return texture;
  }
}