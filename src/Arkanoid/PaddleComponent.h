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
 * Base paddle controller
 */
class PaddleController : public Component {
private:
	GameObject* ball;
	ArkanoidModel* model;
	// if true, paddle is heading left
	bool leftDirection = false;
	float paddleLastPos = 0;
public:

	virtual void Init() {
		ball = owner->GetScene()->FindGameObjectByName("ball");
		model = owner->GetRoot()->GetAttr<ArkanoidModel*>(ARKANOID_MODEL);
	}

	// abstract
	virtual void Update(uint64_t delta, uint64_t absolute) = 0;

protected:

	/**
	 * Moves the paddle either left or right
	 */
	void Move(bool left, uint64_t delta) {

		auto& trans = owner->GetTransform();

		if (left) {
			trans.localPos.x -= model->paddleSpeed*delta;
		}
		else {
			trans.localPos.x += model->paddleSpeed*delta;
		}

		// check boundaries
		trans.localPos.x = max(min(trans.localPos.x, 20.0f), 1.0f);
		
		leftDirection = (trans.localPos.x - paddleLastPos) < 0;
		paddleLastPos = trans.localPos.x;

		// move ball with the paddle
		if(!model->ballReleased) {
			ball->GetTransform().localPos.x = trans.localPos.x + model->ballOffset;
		}
	}

	/**
	 * Releases the ball
	 */
	void ReleaseBall() {
		if(!model->ballReleased) {
			model->ballReleased = true;
			
			// just set the velocity
			auto movement = ball->GetAttr<Dynamics*>(ATTR_DYNAMICS);
			movement->SetVelocity(ofVec2f((paddleLastPos == 0 ? 0 :leftDirection ? -0.3f : 0.3f) * model->ballSpeed, -model->ballSpeed));
		}
	}
};

/**
 * Keyboard controller for paddle
 */
class PaddleInputController : public PaddleController {

	virtual void Update(uint64_t delta, uint64_t absolute) {

		// LEFT
		if (owner->GetContext()->IsKeyPressed(ARK_ACTION_LEFT)) {
			this->Move(true, delta);
		}

		// RIGHT
		if (owner->GetContext()->IsKeyPressed(ARK_ACTION_RIGHT)) {
			this->Move(false, delta);
		}

		// RELEASE
		if (owner->GetContext()->IsKeyPressed(ARK_ACTION_RELEASE)) {
			ReleaseBall();
		}
	}
};