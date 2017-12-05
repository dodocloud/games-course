#pragma once

#include "SteeringComponent.h"
#include "StrId.h"
#include "Component.h"
#include "SteeringMath.h"
#include "AphMain.h"
#include "GameObject.h"
#include "ArkanoidConstants.h"
#include "Scene.h"
#include "ArkanoidModel.h"

/**
 * Component that reacts on life lost and removes appropriate paddle icon
 */
class ArkanoidLifeComponent : public Component {
public:
	ArkanoidModel* model;

	virtual void Init() {
		RegisterSubscriber(ARK_EVENT_LIFE_LOST);
		model = owner->GetRoot()->GetAttr<ArkanoidModel*>(ARKANOID_MODEL);
	}

	virtual void OnMessage(Msg& msg) {
		if(msg.GetAction() == ARK_EVENT_LIFE_LOST) {
			// each icon has its own name, according to the life number
			string lifeName = string_format("life_%d", model->currentLives + 1); // +1, because we have already lost this life
			auto life = owner->GetScene()->FindGameObjectByName(lifeName);
			life->Remove();
		}
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		
	}
};