#pragma once

#include "SteeringComponent.h"
#include "StrId.h"
#include "Component.h"
#include "SteeringMath.h"
#include "AphMain.h"
#include "GameObject.h"
#include "AIAgentsApp.h"
#include "AIModel.h"
#include "SteeringComponent.h"
#include "AIConstants.h"
#include "AIAgentsFactory.h"

/**
 * Functional behavior of a warehouse.
 */
class WarehouseComponent : public Component {
public:
	AIModel* model;

	virtual void Init() {
		model = owner->GetRoot()->GetAttr<AIModel*>(AI_MODEL);
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		
		if(model->warehouseModel.isBuilding) {
			// continue with building procedure
			model->warehouseModel.currentBuildTime += delta;

			if(model->warehouseModel.currentBuildTime >= model->warehouseModel.buildDelay) {
				// spawn a new agent
				model->warehouseModel.currentBuildTime = 0;
				model->warehouseModel.isBuilding = false;
				model->warehouseModel.ironOre -= model->warehouseModel.agentIronCost;
				model->warehouseModel.petrol -= model->warehouseModel.agentPetrolCost;
				model->agentsNum++;
				AIAgentsFactory::CreateAgent(owner->GetRoot(), model, model->warehouseModel.position);
			}
		} else if(model->warehouseModel.ironOre >= model->warehouseModel.agentIronCost && model->warehouseModel.petrol >= model->warehouseModel.agentPetrolCost) {
			// we have enough resources to start build a new agent
			model->warehouseModel.isBuilding = true;
		}
	}
};
