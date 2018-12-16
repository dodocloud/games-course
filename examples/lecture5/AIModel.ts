import Vec2 from '../../ts/utils/Vec2';
import { AIMap, MapBlock } from './AIMap';
import { AGENT_STATE_IDLE, CARGO_TYPE_ORE, AGENT_STATE_LOADING, MAP_BLOCK_WAREHOUSE } from './Constants';

export class WarehouseModel {
    // indicator whether the warehouse is building any agent
    isBuilding = true;
    // building time of current agent
    currentBuildTime = 6000;
    // agent building time in ms
    buildDelay = 7000;
    // current amount of ore
    ironOre = 60;
    // current amount of petrol
    petrol = 40;
    // how much iron does one agent take
    agentIronCost = 30;
    // how much petrol does one agent take
    agentPetrolCost = 10;
    // warehouse position
    position = new Vec2(0);
}

export class AIModel {

	/**
	 * 0: passable path
	 * 1: wall
	 * 2: warehouse
	 * 3: iron ore
	 * 4: petrol
	 */
    mapData = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
        [0, 3, 0, 0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
        [1, 1, 0, 0, 0, 0, 1, 4, 1, 0],
        [3, 0, 0, 0, 0, 0, 0, 0, 1, 0]
    ];

    constructor() {

        // initialize all structures from mapData
        this.map = new AIMap();
        this.map.width = this.mapData[0].length;
        this.map.height = this.mapData.length;

        for (let i = 0; i < this.map.width; i++) {
            for (let j = 0; j < this.map.height; j++) {
                let mapBlock = this.mapData[i][j];
                let block = new MapBlock();
                block.x = i;
                block.y = j;
                block.type = mapBlock;

                if (mapBlock = MAP_BLOCK_WAREHOUSE) {
                    // set position in the model
                    this.warehouseModel.position = new Vec2(i, j);
                }

                this.map.setBlock(i, j, block);
            }
        }

        // init grid in order to be able to search via AStar algorithm
        this.map.initGridMap();
    }


    warehouseModel = new WarehouseModel();
    agentsNum = 0; // number of agents in total
    goingToLoadOre = 0; // number of agents going to load ore
    goingToLoadPetrol = 0; // numbe of agents going to load petrol

    map: AIMap;
}

export class AgentModel {
    agentType: number;
    currentState = AGENT_STATE_IDLE;
    currentCargo = CARGO_TYPE_ORE;

    // loaded amount of cargo
    amount = 0;
    // max capacity of cargo
    capacity = 10;
    // max speed
    speed = 0;

    // un/loading time in ms
    currentLoadingTime = 0;
    // how long does it take to load a cargo
    loadingDelay = 3000;

    isLoaded() {
        return this.amount != 0 && this.currentState != AGENT_STATE_LOADING;
    }
};