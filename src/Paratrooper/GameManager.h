#pragma once

#include "Component.h"
#include "ofImage.h"
#include "AphMain.h"
#include "GameValues.h"
#include "CollisionManager.h"
#include "Scene.h"
#include "ParatrooperModel.h"
#include "ParatrooperComponent.h"
#include "CopterComponent.h"
#include "CopterAnimator.h"

/**
 * Game manager and collision handler
 */
class GameManager : public Component {
	ParatrooperModel* model;
	uint64_t gameOverTime = 0;
	uint64_t lastAbsolute = 0;
public:


	virtual void Init() {
		RegisterSubscriber(COLLISION);
		RegisterSubscriber(PROJECTILE_SHOT);
		RegisterSubscriber(UNIT_KILLED);
		RegisterSubscriber(UNIT_LANDED);
		model = owner->GetRoot()->GetAttr<ParatrooperModel*>(MODEL);
	}

	virtual void OnMessage(Msg& msg) {
		if (model->isGameOver) {
			return;
		}

		if (msg.GetAction() == COLLISION) {
			HandleCollision(msg);
		}
		else if (msg.GetAction() == PROJECTILE_SHOT) {
			// decrease score with each shot
			model->score = max(0, model->score - model->shootPenalty);
		}
		else if (msg.GetAction() == UNIT_LANDED) {

			model->landedUnits++;

			if (model->landedUnits >= model->maxLandedUnits) {
				// GAME OVER
				GameOver(lastAbsolute);
			}
		}
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		this->lastAbsolute = absolute;

		// just wait 5 seconds after game over and reset the game
		if (model->isGameOver && (absolute - gameOverTime) > 5000) {
			owner->GetContext()->ResetGame();
		}
	}

protected:
	void HandleCollision(Msg& msg) {
		auto trigger = msg.GetData<CollisionTrigger>();

		if (trigger->unit->GetName() == OBJECT_COPTER) {
			// copter hit
			model->score += model->copterReward;
			trigger->unit->SetFlag(FLAG_DEAD);
			SendMsg(UNIT_KILLED, trigger->unit);
		}
		else if (trigger->unit->GetName() == OBJECT_PARATROOPER) {
			// we can either kill the paratrooper or blow up his parachute

			if (trigger->unit->GetAttr<ParaState>(PARA_STATE) == ParaState::FALLING) {
				// paratrooper hit while falling
				model->score += model->paratrooperShotReward;
				trigger->unit->SetFlag(FLAG_DEAD);
				SendMsg(UNIT_KILLED, trigger->unit);
			}
			else {
				// paratrooper hit while landing
				auto& unitBB = trigger->unit->GetRenderable()->GetBoundingBox();
				auto& projectileBB = trigger->projectile->GetRenderable()->GetBoundingBox();
				auto state = trigger->unit->GetAttr<ParaState>(PARA_STATE);

				if (state == ParaState::FALLING_PARACHUTE && projectileBB.topLeft.y <= (unitBB.bottomLeft.y - unitBB.GetSize().y / 2)) {
					// remove parachute -> paratrooper is gonna be killed by gravity :-D
					trigger->unit->ChangeAttr<ParaState>(PARA_STATE, ParaState::FALLING_WIHTOUT_PARACHUTE);
				}
				else {
					// we hit the paratrooper's body
					trigger->unit->SetFlag(FLAG_DEAD);
					SendMsg(UNIT_KILLED, trigger->unit);
				}

				// reward is different -> we hit the paratrooper too late
				model->score += model->paratrooperFallingReward;
			}
		}

		trigger->projectile->GetParent()->RemoveChild(trigger->projectile);
	}

	void GameOver(uint64_t absolute) {
		ofLogNotice("GameManager", "GAME OVER");

		// change visibility of the game over text 
		auto gameOver = owner->GetScene()->FindGameObjectByName(OBJECT_GAMEOVER);
		gameOver->GetRenderable()->SetIsVisible(true);
		model->isGameOver = true;
		gameOverTime = absolute;

		// find all paratroopers and set their state to CAPTURING. This will execute
		// the capturing animation
		vector<GameObject*> allParatroopers;
		owner->GetScene()->FindGameObjectsByName(OBJECT_PARATROOPER, allParatroopers);

		for (auto para : allParatroopers) {
			if (para->GetAttr<ParaState>(PARA_STATE) == ParaState::ON_GROUND) {
				para->ChangeAttr(PARA_STATE, ParaState::CAPTURING);
			}
		}

		// notify everyone interested
		SendMsg(GAME_OVER);
	}
};
