import * as ECS from '../../../../libs/pixi-ecs';
import { BotModel, GameModel, CargoSourceModel } from '../model';
import { BotMove } from './bot-ai-move';
import { BotStates, CargoTypes, Attributes } from '../constants';

export class BotAI extends ECS.Component {
	gameModel: GameModel;
	botModel: BotModel;
	moveComponent: BotMove;
	lastState = BotStates.IDLE;
	// un/loading time in ms
	currentLoadingTime = 0;
	// how long does it take to load a cargo
	loadingDelay = 3000;
	currentTarget: CargoSourceModel;

	onInit() {
		this.gameModel = this.scene.getGlobalAttribute(Attributes.GAME_MODEL);
		this.botModel = this.owner.getAttribute(Attributes.BOT_MODEL);
		this.moveComponent = this.owner.findComponentByName<BotMove>(BotMove.name);
	}

	onUpdate(delta: number, absolute: number) {
		let state = this.botModel.currentState;
		let stateChange = state !== this.lastState;

		switch (state) {
			case BotStates.IDLE:
				state = this.processIdleState(stateChange, delta, absolute);
				break;
			case BotStates.GOING_TO_UNLOAD:
				state = this.processGoingToUnloadState(stateChange, delta, absolute);
				break;
			case BotStates.GOING_TO_LOAD:
				state = this.processGoingToLoadState(stateChange, delta, absolute);
				break;
			case BotStates.LOADING:
				state = this.processLoadingState(stateChange, delta, absolute);
				break;
			case BotStates.UNLOADING:
				state = this.processUnloadingState(stateChange, delta, absolute);
				break;
		}

		this.lastState = this.botModel.currentState;
		// update current state
		this.botModel.currentState = state;
	}

	processIdleState(isEntering: boolean, delta: number, absolute: number) {
		// check botModel.isLoaded to assign a goal
		if (this.botModel.isLoaded) {
			return BotStates.GOING_TO_UNLOAD;
		} else {
			return BotStates.GOING_TO_LOAD;
		}
	}

	processGoingToLoadState(isEntering: boolean, delta: number, absolute: number) {
		// check moveComponent.pathFinished - if true, the bot has finished the movement
		if (this.botModel.isLoaded) {
			return BotStates.GOING_TO_UNLOAD;
		}

		if (isEntering) {
			this.goLoad();
			return BotStates.GOING_TO_LOAD;
		}

		if (this.arrivedToTarget) {
			return BotStates.LOADING;
		} else {
			return BotStates.GOING_TO_LOAD;
		}
	}

	processGoingToUnloadState(isEntering: boolean, delta: number, absolute: number) {
		// check moveComponent.pathFinished - if true, the bot has finished the movement
		if (!this.botModel.isLoaded) {
			return BotStates.GOING_TO_LOAD;
		}

		if (isEntering) {
			this.goUnload();
			return BotStates.GOING_TO_UNLOAD;
		}

		if (this.arrivedToTarget) {
			return BotStates.UNLOADING;
		} else {
			return BotStates.GOING_TO_UNLOAD;
		}
	}

	processLoadingState(isEntering: boolean, delta: number, absolute: number) {
		if (this.currentLoadingTime > this.loadingDelay) {
			this.currentLoadingTime = 0;
			if (this.currentTarget) {
				this.gameModel.loadCargo(this.currentTarget, this.botModel);
			}

			return BotStates.IDLE;
		}

		this.currentLoadingTime += delta;
		return BotStates.LOADING;
	}

	processUnloadingState(isEntering: boolean, delta: number, absolute: number) {
		if (this.currentLoadingTime > this.loadingDelay) {
			this.currentLoadingTime = 0;
			this.gameModel.unloadCargo(this.botModel);
			this.currentTarget = null;
			return BotStates.IDLE;
		}

		this.currentLoadingTime += delta;
		return BotStates.UNLOADING;
	}

	// ============================================================================


	/**
		* Selects a random loading target and executes follow behavior
		*/
	protected goLoad() {
		let ores = this.gameModel.getCargoSourcesByType(CargoTypes.ORE);
		let petrols = this.gameModel.getCargoSourcesByType(CargoTypes.PETROL);

		let petrol = this.gameModel.warehouseModel.petrol; // current amount of petrol
		let ore = this.gameModel.warehouseModel.ironOre; // current amount of iron

		let expectedPetrol = petrol + this.gameModel.goingToLoadPetrol * this.botModel.capacity;
		let expectedOre = ore + this.gameModel.goingToLoadOre * this.botModel.capacity;

		// select random target
		if (expectedPetrol > expectedOre) {
			this.currentTarget = ores[Math.floor(Math.random() * ores.length)];
		} else {
			this.currentTarget = petrols[Math.floor(Math.random() * petrols.length)];
		}

		if (this.currentTarget) {
			// notify others and move to the location
			this.gameModel.notifyGoingToLoad(this.currentTarget, this.botModel);
			this.moveToTarget(this.currentTarget.position);
		}
	}

	/**
		* Selects an unloading target and executes follow behavior
		*/
	protected goUnload() {
		let warehouse = this.gameModel.warehouseModel.position;
		this.moveToTarget(new ECS.Vector(warehouse.x, warehouse.y));
	}

	protected get arrivedToTarget() {
		return this.moveComponent.pathFinished;
	}

	protected get isBotLoaded() {
		return this.botModel.isLoaded;
	}

	private moveToTarget(target: ECS.Vector) {
		let agentLocation = new ECS.Vector(this.owner.position.x, this.owner.position.y);
		let agentMapPosition = this.worldToMap(agentLocation);
		this.moveComponent.goToPoint(agentMapPosition, agentLocation, target);
	}

	private worldToMap(pos: ECS.Vector): ECS.Vector {
		return this.gameModel.map.locationToMapBlock(pos);
	}
}