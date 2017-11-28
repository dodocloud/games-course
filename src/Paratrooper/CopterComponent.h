#pragma once

#include "Component.h"
#include "GameObject.h"
#include "GameValues.h"
#include "GameManager.h"
#include "ParatrooperComponent.h"
#include "Dynamics.h"
#include "ParatrooperFactory.h"
#include "ParatrooperModel.h"

/**
 * Component that controls behavior of one copter
 */
class CopterComponent : public Component {
private:
	TransformBuilder bld;
	uint64_t lastSpawnTime = 0;
	ParatrooperModel* gameModel;
	float spawnFrequency;
public:

	virtual void Init() {
		gameModel = owner->GetRoot()->GetAttr<ParatrooperModel*>(MODEL);
		// frequency is dynamic, we need to take its initial value
		spawnFrequency = gameModel->paratrooperSpawnFrequency;
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		
		// update velocity
		auto dynamics = owner->GetAttr<Dynamics*>(ATTR_DYNAMICS);
		dynamics->UpdateVelocity(delta, GetContext()->GetGameSpeed());
		auto& velocity = dynamics->GetVelocity();

		auto& trans = owner->GetTransform();
		// calculate delta position
		auto deltaPos = dynamics->CalcDelta(delta, GetContext()->GetGameSpeed());

		trans.localPos.x += deltaPos.x;

		// check boundaries (scene is scaled to 100x50)
		if ((velocity.x > 0 && trans.localPos.x > 110)
			|| (velocity.x < 0 && trans.localPos.x < -10)) {
			velocity.x = -velocity.x;
		}

		TryCreateParatrooper(absolute);
	}
private:

	void TryCreateParatrooper(uint64_t absolute) {
		auto& trans = owner->GetTransform();

		// check frequency
		if (CheckTime(lastSpawnTime, absolute, spawnFrequency)) {
			lastSpawnTime = absolute;
			auto& thisBB = owner->GetRenderable()->GetBoundingBox();

			// 65% probability at each step
			if (ofRandom(0, 1) > 0.35f) {
				// check if this place is free to drop
				auto tower = GetScene()->FindGameObjectByName(OBJECT_TOWER);
				auto& towerBB = tower->GetRenderable()->GetBoundingBox();

				// don't drop paratrooper above the tower
				if (trans.localPos.x > 10 && ((trans.absPos.x + thisBB.GetSize().x) < towerBB.topLeft.x 
					|| trans.absPos.x > towerBB.topRight.x) && trans.localPos.x < 90) {
					spawnFrequency /= 1.1f; // next drop with less frequency
					ParatrooperFactory::CreateParatrooper(owner, gameModel);
					SendMsg(PARATROOPER_CREATED);
				}
			}
		}
	}
};
