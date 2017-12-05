#pragma once

#include "SteeringComponent.h"
#include "StrId.h"
#include "Component.h"
#include "SteeringMath.h"
#include "AphMain.h"
#include "GameObject.h"
#include "Scene.h"

/**
 * Global game component that orchestrates the whole game
 */
class GameComponent : public Component {
public:
	ArkanoidModel* model;

	// attributes for delayed game reset
	bool resetPending = false;
	uint64_t resetTime = 0;
	int resetDuration = 3000;

	GameObject* paddle;
	GameObject* ball;

	virtual void Init() {
		RegisterSubscriber(ARK_EVENT_BALL_OUTSIDE_AREA);
		RegisterSubscriber(ARK_COMMAND_FINISH_LEVEL);

		model = owner->GetRoot()->GetAttr<ArkanoidModel*>(ARKANOID_MODEL);
		ball = owner->GetScene()->FindGameObjectByName("ball");
		paddle = owner->GetScene()->FindGameObjectByName("paddle");

		if (model->currentRound == 0) {
			// init the first round
			ResolveNextRound();
		}
	}

	virtual void OnMessage(Msg& msg) {
		if (msg.GetAction() == ARK_EVENT_BALL_OUTSIDE_AREA) {
			ResolveLifeLost();
		}
		else if (msg.GetAction() == ARK_COMMAND_FINISH_LEVEL) {
			ResolveLevelCompleted();
		}
	}


	void ResolveLevelCompleted() {
		// go to the next level
		resetPending = true;
		if (model->currentLevel == model->maxLevels) {
			model->currentLevel = 0; // back to intro scene
			SendMsg(ARK_EVENT_GAME_COMPLETED);
		}
		else {
			model->currentLevel++;
			// slightly increase ball speed
			model->ballSpeed *= model->ballSpeedMultiplier;
			SendMsg(ARK_EVENT_LEVEL_COMPLETED);
		}
		ball->Remove();
	}

	void ResolveLifeLost() {
		model->currentLives--;
		SendMsg(ARK_EVENT_LIFE_LOST);

		if (model->currentLives == 0) {
			resetPending = true;
			// game over -> go back to intro scene
			model->currentLevel = 0;
			SendMsg(ARK_EVENT_GAME_OVER);
			ball->Remove();
		}
		else {
			ResolveNextRound();
		}
	}

	void ResolveNextRound() {
		auto dynamics = ball->GetAttr<Dynamics*>(ATTR_DYNAMICS);
		model->currentRound++;
		dynamics->SetVelocity(ofVec2f(0, 0));
		model->ballReleased = false;
		auto meshScale = owner->GetContext()->GetMeshDefaultScale();

		// set the position of the ball to touch the paddle
		TransformBuilder trbld;
		trbld.LocalPosition(ofVec2f(paddle->GetTransform().localPos.x + model->ballOffset, 22.4f))
			.LocalScale(ofVec2f(meshScale, meshScale)).BuildAndReset(ball);

		if (model->currentRound == 1) {
			// first round -> LEVEL started
			SendMsg(ARK_EVENT_LEVEL_STARTED);
		}
		else {
			SendMsg(ARK_EVENT_ROUND_STARTED);
		}
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {

		// reset game with delay (this could be done much more efficiently in Lua!) 
		if (resetPending) {
			if (resetTime >= resetDuration) {
				resetTime = 0;
				owner->GetContext()->ResetGame();
			}
			else {
				resetTime += delta;
			}
		}
	}
};