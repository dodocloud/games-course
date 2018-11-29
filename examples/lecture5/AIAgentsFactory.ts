import { DynamicsComponent } from './../../ts/components/DynamicsComponent';
import { WarehouseComponent } from './WarehouseComponent';
import { AIModel, AgentModel } from './AIModel';
import { PIXICmp } from "../../ts/engine/PIXIObject";
import Vec2 from '../../ts/utils/Vec2';
import { WarehouseStateComponent } from './WarehouseStateComponent';
import PIXIObjectBuilder from '../../ts/engine/PIXIObjectBuilder';
import { AGENT_TYPE_BLUE, AGENT_TYPE_RED, ATTR_AGENT_MODEL, ATTR_FACTORY } from './Constants';
import Dynamics from '../../ts/utils/Dynamics';
import {
    ATTR_AI_MODEL, MAP_BLOCK_PATH, MAP_BLOCK_WALL, MAP_BLOCK_WAREHOUSE,
    MAP_BLOCK_ORE, MAP_BLOCK_PETROL, MAP_BLOCK_SIZE, TEXTURE_AI
} from './Constants';
import { ATTR_DYNAMICS } from '../../ts/engine/Constants';
import { AgentAIMoveComponent } from './AgentAIMoveComponent';
import { AgentAnimComponent } from './AgentAnimComponent';
import { AgentAIComponent } from './AgentAIComponent';
import DebugComponent from '../../ts/components/DebugComponent';

/**
 * Factory for game objects
 */
export class AIAgentsFactory {

    initializeGame(stage: PIXICmp.ComponentObject, model: AIModel) {
        stage.addAttribute(ATTR_AI_MODEL, model);
        stage.addAttribute(ATTR_FACTORY, this);
        stage.addComponent(new WarehouseComponent());
        //stage.addComponent(new DebugComponent(document.getElementById("debugSect")));
        stage.getPixiObj().scale.set(0.5);

        let texture = PIXI.Texture.fromImage(TEXTURE_AI);

        // add sprites
        for (let i = 0; i < model.map.width; i++) {
            for (let j = 0; j < model.map.height; j++) {
                let mapType = model.map.getBlock(i, j).type;
                let spriteRect: PIXI.Rectangle;

                // transform block index to sprite index
                switch (mapType) {
                    case MAP_BLOCK_PATH:
                        spriteRect = new PIXI.Rectangle(0, 128 * 2, 128, 128);
                        break;
                    case MAP_BLOCK_WALL:
                        spriteRect = new PIXI.Rectangle(128, 128 * 2, 128, 128);
                        break;
                    case MAP_BLOCK_WAREHOUSE:
                        spriteRect = new PIXI.Rectangle(128 * 2, 128 * 2, 128, 128);
                        break;
                    case MAP_BLOCK_ORE:
                        spriteRect = new PIXI.Rectangle(128 * 3, 128 * 2, 128, 128);
                        break;
                    case MAP_BLOCK_PETROL:
                        spriteRect = new PIXI.Rectangle(0, 128 * 3, 128, 128);
                        break;
                    default:
                        throw new Error("Undefined block type");
                }

                // warehouse
                if (mapType == MAP_BLOCK_WAREHOUSE) {
                    model.warehouseModel.position = new Vec2(i, j);
                }

                let textureCl = texture.clone();
                textureCl.frame = spriteRect;
                let sprite = new PIXICmp.Sprite("", textureCl);
                sprite.position.set(i * MAP_BLOCK_SIZE, j * MAP_BLOCK_SIZE);
                stage.getPixiObj().addChild(sprite);
            }
        }

        // place the status next to the map
        new PIXIObjectBuilder(stage.getScene())
            .relativePos(1, 0)
            .anchor(1, 0)
            .withComponent(new WarehouseStateComponent())
            .build(new PIXICmp.Text("", ""), stage);
    }

    createAgent(stage: PIXICmp.ComponentObject, model: AIModel, position: Vec2) {
        let type = AGENT_TYPE_BLUE;
        let texture = PIXI.Texture.fromImage(TEXTURE_AI);

        if (Math.random() > 0.5) {
            type = AGENT_TYPE_RED;
        }

        let textureCl = texture.clone();
        let agent = new PIXICmp.Sprite("Agent", textureCl);

        stage.getPixiObj().addChild(agent);

        // create movement attribute for dynamics
        let dynamics = new Dynamics();
        agent.addAttribute(ATTR_DYNAMICS, dynamics);

        // create model with random speed
        let agentModel = new AgentModel();
        agentModel.speed = Math.random() * 30 + 30;
        agentModel.agentType = type;
        agent.addAttribute(ATTR_AGENT_MODEL, agentModel);
        agent.addComponent(new DynamicsComponent());
        agent.addComponent(new AgentAIMoveComponent());
        agent.addComponent(new AgentAnimComponent());
        agent.addComponent(new AgentAIComponent());
        agent.anchor.set(0.5);

        let realPosition = model.map.mapBlockToLocation(position.x, position.y);

        // place the agent next to the warehouse
        agent.position.set(realPosition.x, realPosition.y);
    }
}