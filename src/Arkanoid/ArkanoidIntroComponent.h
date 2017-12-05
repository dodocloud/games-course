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
 * Component that only waits for a certain amount of time and switches from the intro to the first level
 */
class ArkanoidIntroComponent : public Component {
private:
	int introShowDelay = 5000;
	int introShowTime = 0;
	ArkanoidModel* model;
public:

	virtual void Init() {
		model = owner->GetRoot()->GetAttr<ArkanoidModel*>(ARKANOID_MODEL);
		SendMsg(ARK_EVENT_GAME_STARTED); // notify other components that the game has just started
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		introShowTime += delta;

		if (introShowTime > introShowDelay) {
			// go to the first level
			model->currentLevel = 1;
			owner->GetContext()->ResetGame();
		}
	}
};