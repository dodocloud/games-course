import Component from '../../ts/engine/Component';
import { AIModel, AgentModel } from './AIModel';
import { AgentAIMoveComponent } from './AgentAIMoveComponent';
import { AGENT_STATE_IDLE, ATTR_AI_MODEL, ATTR_AGENT_MODEL, AGENT_STATE_GOING_TO_UNLOAD, AGENT_STATE_GOING_TO_LOAD, AGENT_STATE_LOADING, AGENT_STATE_UNLOADING, 
    CARGO_TYPE_ORE, CARGO_TYPE_PETROL, MAP_BLOCK_ORE, MAP_BLOCK_PETROL, MAP_BLOCK_WAREHOUSE } from './Constants';
import Vec2 from '../../ts/utils/Vec2';
import { MapBlock } from './AIMap';

export class AgentAIComponent extends Component {
    gameModel: AIModel;
    agentModel: AgentModel;
    moveComponent: AgentAIMoveComponent;
    lastState = AGENT_STATE_IDLE;

    onInit() {
        this.gameModel = this.scene.getGlobalAttribute(ATTR_AI_MODEL);
        this.agentModel = this.owner.getAttribute(ATTR_AGENT_MODEL);
        this.moveComponent = <AgentAIMoveComponent>this.owner.findComponentByClass(AgentAIMoveComponent.name);
    }

    onUpdate(delta: number, absolute: number) {
        let state = this.agentModel.currentState;
        let stateChange = state != this.lastState;

        switch (state) {
            case AGENT_STATE_IDLE:
                state = this.processIdleState(stateChange, delta, absolute);
                break;
            case AGENT_STATE_GOING_TO_UNLOAD:
                state = this.processGoingToUnloadState(stateChange, delta, absolute);
                break;
            case AGENT_STATE_GOING_TO_LOAD:
                state = this.processGoingToLoadState(stateChange, delta, absolute);
                break;
            case AGENT_STATE_LOADING:
                state = this.processLoadingState(stateChange, delta, absolute);
                break;
            case AGENT_STATE_UNLOADING:
                state = this.processUnloadingState(stateChange, delta, absolute);
                break;
        }

        this.lastState = this.agentModel.currentState;
        // update current state 
        this.agentModel.currentState = state;
    }

    processIdleState(isEntering: boolean, delta: number, absolute: number) {
        // TODO implement
        return AGENT_STATE_IDLE;
    }

    processGoingToLoadState(isEntering: boolean, delta: number, absolute: number) {
        // TODO implement
        return AGENT_STATE_GOING_TO_LOAD;
    }

    processGoingToUnloadState(isEntering: boolean, delta: number, absolute: number) {
         // TODO implement
        return AGENT_STATE_GOING_TO_UNLOAD;
    }

    processLoadingState(isEntering: boolean, delta: number, absolute: number) {
        // TODO implement
        return AGENT_STATE_LOADING;
    }

    processUnloadingState(isEntering: boolean, delta: number, absolute: number) {
        // TODO implement
        return AGENT_STATE_UNLOADING;
    }

    // ============================================================================


	/**
	 * Selects a loading target and executes follow behavior
	 */
    goLoad() {
        let ores = this.gameModel.map.findAllMapBlocks(MAP_BLOCK_ORE);
        let petrols = this.gameModel.map.findAllMapBlocks(MAP_BLOCK_PETROL);

        let petrol = this.gameModel.warehouseModel.petrol; // current amount of petrol
        let ore = this.gameModel.warehouseModel.ironOre; // current amount of iron

        let selectedTarget: MapBlock = ores[Math.floor(Math.random() * ores.length)];

        // TODO implement also petrol

        let agentLocation = new Vec2(this.owner.getPixiObj().position.x, this.owner.getPixiObj().position.y);
        let agentMapPosition = this.gameModel.map.locationToMapBlock(agentLocation);
        let orePosition = new Vec2(selectedTarget.x, selectedTarget.y);

        if (selectedTarget.type == MAP_BLOCK_PETROL) {
            this.agentModel.currentCargo = CARGO_TYPE_PETROL;
            this.gameModel.goingToLoadPetrol++;
        } else {
            this.agentModel.currentCargo = CARGO_TYPE_ORE;
            this.gameModel.goingToLoadOre++;
        }

        this.moveComponent.goToPoint(agentMapPosition, agentLocation, orePosition);
    }

	/**
	 * Selects an unloading target and executes follow behavior
	 */
    goUnload() {
        let agentLocation = new Vec2(this.owner.getPixiObj().position.x, this.owner.getPixiObj().position.y);
        let agentMapPosition = this.gameModel.map.locationToMapBlock(agentLocation);
        let warehousePosition = this.gameModel.map.findNearestMapBlock(agentMapPosition, MAP_BLOCK_WAREHOUSE);
        this.moveComponent.goToPoint(agentMapPosition, agentLocation, warehousePosition);
    }
}