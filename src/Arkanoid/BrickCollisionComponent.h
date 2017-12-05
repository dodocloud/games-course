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
 * Resolver for BALL-BRICK collision
 */
class BrickCollisionComponent : public Component {
public:
	ArkanoidModel* model;
	GameObject* bricks;

	virtual void Init() {
		RegisterSubscriber(ARK_EVENT_OBJECT_HIT);

		model = owner->GetRoot()->GetAttr<ArkanoidModel*>(ARKANOID_MODEL);
		bricks = owner->GetScene()->FindGameObjectByName("bricks");
	}

	virtual void OnMessage(Msg& msg) {
		if (msg.GetAction() == ARK_EVENT_OBJECT_HIT) {
			
			HitInfo* info = msg.GetData<HitInfo>();

			if (info->hitType == HIT_TYPE_BLOCK) {
				ResolveBrickHit(info);
			}
		}
	}

	/**
	 * Resolves the collision
	 */
	void ResolveBrickHit(HitInfo* info) {
		auto mesh = bricks->GetMesh<MultiSpriteMesh>();
		auto sprite = mesh->GetSprite(info->hitIndex);
		auto& brick = model->GetBrick(sprite);

		if (brick.type != ARK_BRICK_INDESTRUCTIBLE) {
			// decrement number of bricks
			model->remainingBricks--;

			// remove brick from the model
			auto position = brick.position;
			model->RemoveBrick(position);

			mesh->RemoveSprite(sprite);

			if (model->remainingBricks == 0) {
				// send command message in order to finish the current level
				SendMsg(ARK_COMMAND_FINISH_LEVEL);
			}
		}
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {

	}
};