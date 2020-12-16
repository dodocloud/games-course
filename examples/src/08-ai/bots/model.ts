import { Vector } from '../../../libs/pixi-ecs';
import { GameMap, MapBlock } from './gamemap';
import { MapBlocks, BotStates, CargoTypes } from './constants';

export class WarehouseModel {
	// current amount of ore
	ironOre = 60;
	// current amount of petrol
	petrol = 40;
	// how much iron does one agent take
	agentIronCost = 30;
	// how much petrol does one agent take
	agentPetrolCost = 10;
	// warehouse position
	position = new Vector(0);
}

export class FactoryModel {
	position = new Vector(0);
}

export class CargoSourceModel {
	type: CargoTypes;
	position: Vector;
	currentAmount: number;

	constructor(type: CargoTypes, position: Vector, currentAmount: number) {
		this.type = type;
		this.position = position;
		this.currentAmount = currentAmount;
	}

	get exhausted() {
		return this.currentAmount <= 0;
	}
}

export class BotModel {
	agentType: number;
	currentState = BotStates.IDLE;
	currentCargo = CargoTypes.NONE;

	// loaded amount of cargo
	amount = 0;
	// max capacity of cargo
	capacity = 10;
	// max speed
	speed = 0;


	get isLoaded() {
		return this.amount !== 0 && this.currentState !== BotStates.LOADING;
	}
}

export class GameModel {
	warehouseModel = new WarehouseModel();
	factoryModel = new FactoryModel();


	map: GameMap;

	/**
	 * 0: passable path
	 * 1: wall
	 * 2: warehouse
	 * 3: iron ore
	 * 4: petrol
	 */
	mapData = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0, 0, 0, 0, 4],
		[0, 3, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 2, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 4],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
		[1, 1, 0, 0, 0, 0, 1, 4, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
		[3, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
		[0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1],
		[0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 3],
		[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 3],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3],
	];

	private _botsNum = 0; // number of agents in total
	private _goingToLoadOre = 0; // number of agents going to load ore
	private _goingToLoadPetrol = 0; // numbe of agents going to load petrol
	private _cargoSources: Map<number, CargoSourceModel> = new Map();
	private _bots: BotModel[] = [];

	constructor() {

		// initialize all structures from mapData
		this.map = new GameMap();
		this.map.width = this.mapData[0].length;
		this.map.height = this.mapData.length;

		for (let i = 0; i < this.map.width; i++) {
			for (let j = 0; j < this.map.height; j++) {
				let mapBlock = this.mapData[j][i];
				let block = new MapBlock();
				block.x = i;
				block.y = j;
				block.type = mapBlock;

				if (mapBlock === MapBlocks.WAREHOUSE) {
					// set position in the model
					this.warehouseModel.position = new Vector(i, j);
				} else if (mapBlock === MapBlocks.FACTORY) {
					// set position in the model
					this.factoryModel.position = new Vector(i, j);
				} else if (mapBlock === MapBlocks.ORE) {
					let randomAmount = Math.floor(20 + Math.random() * 50);
					this._cargoSources.set(j * this.map.width + i, new CargoSourceModel(CargoTypes.ORE, new Vector(i, j), randomAmount));
				} else if (mapBlock === MapBlocks.PETROL) {
					let randomAmount = Math.floor(20 + Math.random() * 50);
					this._cargoSources.set(j * this.map.width + i, new CargoSourceModel(CargoTypes.PETROL, new Vector(i, j), randomAmount));
				}

				this.map.setBlock(i, j, block);
			}
		}

		// init grid in order to be able to search via AStar algorithm
		this.map.initGridMap();
	}

	public get botsNum() {
		return this._botsNum;
	}

	public get goingToLoadOre() {
		return this._goingToLoadOre;
	}

	public get goingToLoadPetrol() {
		return this._goingToLoadPetrol;
	}

	public get allBots() {
		return this._bots;
	}

	getCargoSourcesByType(type: CargoTypes, includeExhausted: boolean = false): CargoSourceModel[] {
		let output: CargoSourceModel[] = [];
		for (let [, cargo] of this._cargoSources) {
			if (cargo.type === type && (includeExhausted || !cargo.exhausted)) {
				output.push(cargo);
			}
		}
		return output;
	}

	getCargoSourceAtLocation(location: Vector): CargoSourceModel {
		let index = this.map.gridMap.indexMapper(location);
		if (this._cargoSources.has(index)) {
			return this._cargoSources.get(index);
		}
		return null;
	}

	loadCargo(source: CargoSourceModel, bot: BotModel) {
		bot.currentCargo = source.type;
		let amount = Math.min(source.currentAmount, bot.capacity);
		bot.amount = amount;
		source.currentAmount -= amount;

		bot.currentCargo = source.type;

		if (source.type === CargoTypes.ORE) {
			this._goingToLoadOre--;
		} else if (source.type === CargoTypes.PETROL) {
			this._goingToLoadPetrol--;
		}
	}

	unloadCargo(bot: BotModel) {
		if (bot.currentCargo === CargoTypes.ORE) {
			this.warehouseModel.ironOre += bot.amount;
		} else if (bot.currentCargo === CargoTypes.PETROL) {
			this.warehouseModel.petrol += bot.amount;
		}
		bot.amount = 0;
	}

	notifyGoingToLoad(source: CargoSourceModel, bot: BotModel) {
		if (source.type === CargoTypes.ORE) {
			this._goingToLoadOre++;
		} else if (source.type === CargoTypes.PETROL) {
			this._goingToLoadPetrol++;
		}
	}

	addBot(bot: BotModel) {
		this._bots.push(bot);
		this._botsNum++;
	}
}