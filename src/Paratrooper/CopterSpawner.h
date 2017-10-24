#pragma once

#include "Component.h"
#include "ofImage.h"
#include "AphMain.h"
#include "CopterComponent.h"
#include "ParatrooperModel.h"

/**
 * Component that spawns copters
 */
class CopterSpawner : public Component {
	uint64_t lastSpawnTime = 0;
	float spawnFrequency;
	ParatrooperModel* model;
public:

	virtual void Init() {
		RegisterSubscriber(UNIT_KILLED);
		model = owner->GetRoot()->GetAttr<ParatrooperModel*>(MODEL);
		// get the initial value
		this->spawnFrequency = model->copterSpawnFrequency;
	}

	virtual void OnMessage(Msg& msg) {
		// check if the copter was killed and decrease the amount
		if(msg.GetAction() == UNIT_KILLED && msg.GetData<GameObject>()->GetName() == OBJECT_COPTER) {
			model->coptersCreated--;
		}
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		if (CheckTime(lastSpawnTime, absolute, spawnFrequency)) {
			model->coptersCreated++;
			lastSpawnTime = absolute;
			spawnFrequency *= 1.02f; // increase frequency, this is gonna be fun :-)
			ParatrooperFactory::CreateCopter(owner, model);
			SendMsg(COPTER_CREATED);
		}
	}
};
