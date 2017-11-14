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
 * Component that displays current warehouse state
 */
class WarehouseStateComponent : public Component {
public:
	AIModel* model;

	virtual void Init() {
		model = owner->GetRoot()->GetAttr<AIModel*>(AI_MODEL);
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		auto mesh = owner->GetMesh<Text>();

		int percentage = 0;

		if(model->warehouseModel.isBuilding) {
			percentage = (model->warehouseModel.currentBuildTime * 1.0f) / model->warehouseModel.buildDelay * 100;
		}

		mesh->SetText(string_format("IRON: %d\nPETROL: %d\nBUILDING: %d%%\nAGENTS: %d", model->warehouseModel.ironOre, model->warehouseModel.petrol, percentage, model->agentsNum));
	}
};
