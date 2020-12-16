import * as ECS from '../../../../libs/pixi-ecs';
import { GameModel } from '../model';
import { BotFactory } from '../bot-factory';
import { Attributes } from '../constants';

/**
 * Component for the factory - responsible for building new bots
 */
export class FactoryBuilding extends ECS.Component {
	model: GameModel;
	factory: BotFactory;
	// indicator whether the warehouse is building any agent
	isBuilding = true;
	// building time of current agent
	currentBuildTime = 6000;
	// bot building time in ms
	buildDelay = 7000;

	onInit() {
		this.model = this.scene.getGlobalAttribute(Attributes.GAME_MODEL);
		this.factory = this.scene.getGlobalAttribute(Attributes.FACTORY);
	}

	onUpdate(delta: number, absolute: number) {
		if (this.isBuilding) {
			// continoue with building procedure
			this.currentBuildTime += delta;

			if (this.currentBuildTime >= this.buildDelay) {
				// spawn a new agent
				this.currentBuildTime = 0;
				this.isBuilding = false;
				this.model.warehouseModel.ironOre -= this.model.warehouseModel.agentIronCost;
				this.model.warehouseModel.petrol -= this.model.warehouseModel.agentPetrolCost;
				let botModel = this.factory.createBot(this.scene.stage, this.model, this.model.factoryModel.position);
				this.model.addBot(botModel);
			}
		} else if (this.model.warehouseModel.ironOre >= this.model.warehouseModel.agentIronCost && this.model.warehouseModel.petrol >= this.model.warehouseModel.agentPetrolCost) {
			// we have enough resources to start building a new agent
			this.isBuilding = true;
		}
	}
}