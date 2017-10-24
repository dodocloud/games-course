#pragma once

#include "Component.h"
#include "CompValues.h"
#include "ofImage.h"
#include "GameValues.h"
#include "ParatrooperFactory.h"
#include "DeathChecker.h"
#include "ParatrooperModel.h"

/**
 * Base class that controls canon
 */
class CannonController : public Component {
private:
	// time of the last shot
	uint64_t lastShot = 0;
	ParatrooperModel* gameModel;
public:
	
	virtual void Init() {
		gameModel = owner->GetRoot()->GetAttr<ParatrooperModel*>(MODEL);
	}

	// abstract
	virtual void Update(uint64_t delta, uint64_t absolute) = 0;

protected:


	/**
	 * Rotates the canon according to the delta time
	 */
	void Rotate(Dir direction, uint64_t delta) {

		auto& trans = owner->GetTransform();

		if (direction == Dir::LEFT) {
			trans.rotation -= 0.003f*delta;
		}
		else {
			trans.rotation += 0.003f*delta;
		}

		// check boundaries
		trans.rotation = max(min(trans.rotation, gameModel->maxCannonAngle), gameModel->minCannonAngle);
	}

	/**
	 * Tries to shoot the projectile according to the fire rate
	 */
	bool TryFire(uint64_t absolute) {
		if (CheckTime(lastShot, absolute, gameModel->cannonFireRate)) {
			lastShot = absolute;
			ParatrooperFactory::CreateProjectile(owner, gameModel);
			SendMsg(PROJECTILE_SHOT);
			return true;
		}
		else {
			return false;
		}
	}
};

/**
 * Cannon controller that checks pressed keys
 */
class CannonInputController : public CannonController {
	virtual void Update(uint64_t delta, uint64_t absolute) {
		auto& pressedKeys = owner->GetContext()->GetPressedKeys();

		// keys are mapped inside ParatrooperApp

		// LEFT
		if (pressedKeys.find(GetContext()->GetMappedKey(ACTION_LEFT)) != pressedKeys.end()) {
			this->Rotate(Dir::LEFT, delta);
		}

		// RIGHT
		if (pressedKeys.find(GetContext()->GetMappedKey(ACTION_RIGHT)) != pressedKeys.end()) {
			this->Rotate(Dir::RIGHT, delta);
		}

		// FIRE
		if (pressedKeys.find(GetContext()->GetMappedKey(ACTION_FIRE)) != pressedKeys.end()) {
			TryFire(absolute);
		}
	}
};