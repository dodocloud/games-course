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
 * Component that shows game status such as GAME OVER, ROUND 2 etc.
 */
class ArkanoidStatusComponent : public Component {
private:
	// show all texts for 3 seconds
	int statusShowDelay = 3000;
	int statusShowTime = 0;
	bool isShowing = 0;
	ArkanoidModel* model;
public:

	virtual void Init() {
		model = owner->GetRoot()->GetAttr<ArkanoidModel*>(ARKANOID_MODEL);
		RegisterSubscriber(ARK_EVENT_LEVEL_STARTED);
		RegisterSubscriber(ARK_EVENT_ROUND_STARTED);
		RegisterSubscriber(ARK_EVENT_GAME_OVER);
		RegisterSubscriber(ARK_EVENT_LEVEL_COMPLETED);
		RegisterSubscriber(ARK_EVENT_GAME_COMPLETED);

	}

	virtual void OnMessage(Msg& msg) {
		if (msg.GetAction() == ARK_EVENT_LEVEL_STARTED) {
			ShowText(string_format("LEVEL %d", model->currentLevel));
		}
		else if (msg.GetAction() == ARK_EVENT_ROUND_STARTED) {
			ShowText(string_format("ROUND %d", model->currentRound));
		}
		else if (msg.GetAction() == ARK_EVENT_GAME_OVER) {
			ShowText(string_format("GAME OVER"));
		}
		else if (msg.GetAction() == ARK_EVENT_LEVEL_COMPLETED) {
			ShowText(string_format("LEVEL COMPLETED"));
		}
		else if (msg.GetAction() == ARK_EVENT_GAME_COMPLETED) {
			ShowText(string_format("!!!YOU WIN THE GAME!!!"));
		}
	}

	void ShowText(string text) {
		auto mesh = owner->GetMesh<Text>();
		mesh->SetIsVisible(true);
		mesh->SetText(text);
		isShowing = true;
		statusShowTime = 0;
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		if (isShowing) {
			statusShowTime += delta;

			if (statusShowTime > statusShowDelay) {
				statusShowTime = 0;
				owner->GetMesh<Text>()->SetIsVisible(false);
				isShowing = false;
			}
		}
	}
};