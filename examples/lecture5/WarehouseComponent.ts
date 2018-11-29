import { ATTR_AI_MODEL, ATTR_FACTORY } from './Constants';
import { AIModel } from './AIModel';
import Component from '../../ts/engine/Component';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { AIAgentsFactory } from './AIAgentsFactory';

/**
 * Component for the warehouse - responsible for building new agents
 */
export class WarehouseComponent extends Component {
    model: AIModel;
    factory: AIAgentsFactory;


    onInit(){
        this.model = this.scene.getGlobalAttribute(ATTR_AI_MODEL);
        this.factory = this.scene.getGlobalAttribute(ATTR_FACTORY);
    }

    onUpdate(delta: number, absolute: number){
		if(this.model.warehouseModel.isBuilding) {
			// continue with building procedure
			this.model.warehouseModel.currentBuildTime += delta;

			if(this.model.warehouseModel.currentBuildTime >= this.model.warehouseModel.buildDelay) {
				// spawn a new agent
				this.model.warehouseModel.currentBuildTime = 0;
				this.model.warehouseModel.isBuilding = false;
				this.model.warehouseModel.ironOre -= this.model.warehouseModel.agentIronCost;
				this.model.warehouseModel.petrol -= this.model.warehouseModel.agentPetrolCost;
                this.model.agentsNum++;
                this.factory.createAgent(this.scene.stage, this.model, this.model.warehouseModel.position);
			}
		} else if(this.model.warehouseModel.ironOre >= this.model.warehouseModel.agentIronCost && this.model.warehouseModel.petrol >= this.model.warehouseModel.agentPetrolCost) {
			// we have enough resources to start build a new agent
			this.model.warehouseModel.isBuilding = true;
		}
    }
}