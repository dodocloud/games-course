import * as ECSA from '../../../../libs/pixi-component';
import { WarehouseComponent } from './warehouse-component';
import DynamicsComponent from '../../../utils/dynamics-component';
import { GameModel, BotModel } from './model';
import { WarehouseStateComponent } from './warehouse-state-component';
import { BotTypes, Attributes, Assets, MapBlocks, MAP_BLOCK_SIZE } from './constants';
import { BotMoveComponent } from './bot-ai-move-component';
import { BotAnimComponent } from './bot-anim-component';
import { BotAIComponent } from './bot-ai-component';
import Dynamics from '../../../utils/dynamics';
import { ProgressComponent } from './progress-component';
import { FactoryComponent } from './factory-component';
import { CargoSourceComponent } from './cargo-source-component';

/**
 * Factory for game objects
 */
export class BotFactory {

  initializeGame(stage: ECSA.Container, model: GameModel) {
    stage.assignAttribute(Attributes.GAME_MODEL, model);
    stage.assignAttribute(Attributes.FACTORY, this);
    stage.asContainer().scale.set(4.7 / model.map.height);

    let texture = new PIXI.Texture(PIXI.BaseTexture.from(Assets.TEXTURE));

    // add sprites
    for (let i = 0; i < model.map.width; i++) {
      for (let j = 0; j < model.map.height; j++) {
        let mapType = model.map.getBlock(i, j).type;
        let spriteRect: PIXI.Rectangle;

        // transform block index to sprite index
        switch (mapType) {
          case MapBlocks.PATH:
            spriteRect = new PIXI.Rectangle(0, 128 * 2, 128, 128);
            break;
          case MapBlocks.WALL:
            spriteRect = new PIXI.Rectangle(128, 128 * 2, 128, 128);
            break;
          case MapBlocks.WAREHOUSE:
            spriteRect = new PIXI.Rectangle(128 * 2, 128 * 2, 128, 128);
            break;
          case MapBlocks.ORE:
            spriteRect = new PIXI.Rectangle(128 * 3, 128 * 2, 128, 128);
            break;
          case MapBlocks.PETROL:
            spriteRect = new PIXI.Rectangle(0, 128 * 3, 128, 128);
            break;
          case MapBlocks.FACTORY:
            spriteRect = new PIXI.Rectangle(128 * 3, 128 * 3, 128, 128);
            break;
          default:
            throw new Error('Undefined block type');
        }

        let textureCl = texture.clone();
        textureCl.frame = spriteRect;
        let sprite = new ECSA.Sprite('', textureCl);
        sprite.position.set(i * MAP_BLOCK_SIZE, j * MAP_BLOCK_SIZE);
        stage.addChild(sprite);

        if (mapType === MapBlocks.ORE || mapType === MapBlocks.PETROL) {
          sprite.addComponent(new CargoSourceComponent(model.getCargoSourceAtLocation(new ECSA.Vector(i, j))));
        } else if (mapType === MapBlocks.WAREHOUSE) {
          sprite.addComponent(new WarehouseComponent());
        } else if (mapType === MapBlocks.FACTORY) {
          let factoryCmp = new FactoryComponent();
          sprite.addComponent(factoryCmp);
          let progress = new ECSA.Graphics('factory_progress');
          progress.addComponent(new ProgressComponent(() => (factoryCmp.currentBuildTime * 1.0) / factoryCmp.buildDelay));
          sprite.addChild(progress);
        }
      }
    }

    // place the status next to the map
    new ECSA.Builder(stage.scene)
      .relativePos(1, 0)
      .anchor(1, 0)
      .withComponent(new WarehouseStateComponent())
      .withParent(stage)
      .asText('')
      .build();
  }

  createBot(stage: ECSA.Container, model: GameModel, position: ECSA.Vector): BotModel {
    let type = BotTypes.BLUE;
    let texture = new PIXI.Texture(PIXI.BaseTexture.from(Assets.TEXTURE));
    let textureCl = texture.clone();
    let agent = new ECSA.Sprite('Bot', textureCl);

    stage.addChild(agent);

    // create movement attribute for dynamics
    let dynamics = new Dynamics();
    agent.assignAttribute(Attributes.DYNAMICS, dynamics);

    // create model with random speed
    let botModel = new BotModel();
    botModel.speed = Math.random() * 30 + 30;
    botModel.agentType = type;
    agent.assignAttribute(Attributes.BOT_MODEL, botModel);
    agent.addComponent(new DynamicsComponent(Attributes.DYNAMICS));
    agent.addComponent(new BotMoveComponent());
    agent.addComponent(new BotAnimComponent());
    agent.addComponent(new BotAIComponent());
    agent.anchor.set(0.5);
    let realPosition = model.map.mapBlockToLocation(position.x + 0.5, position.y + 0.5);

    // place the agent next to the warehouse
    agent.position.set(realPosition.x, realPosition.y);
    return botModel;
  }
}