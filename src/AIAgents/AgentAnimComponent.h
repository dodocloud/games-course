#pragma once

#include "SteeringComponent.h"
#include "StrId.h"
#include "Component.h"
#include "SteeringMath.h"
#include "AphMain.h"
#include "GameObject.h"
#include "AIAgentsApp.h"

/**
 * Simple agent animation component that only switches between sprite sheet frames
 */
class AgentAnimComponent : public Component {
public:
	int changeFrequency = 10;
	uint64_t lastSwitchTime = 0;

	virtual void Update(uint64_t delta, uint64_t absolute) {
		
		auto model = owner->GetAttr<AgentModel*>(ATTR_AGENTMODEL);
		auto& movement = owner->GetAttr<Movement>(ATTR_MOVEMENT);
		auto velocity = movement.GetVelocity();
		auto mesh = owner->GetMesh<SpriteMesh>();
		auto& sprite = mesh->GetSprite();

		if(velocity.length() < 1) {
			// no animation
			if (model->agentType == AgentType::BLUE) {
				sprite.SetFrame(0);
			}
			else {
				sprite.SetFrame(4);
			}
		}else {
			if (CheckTime(lastSwitchTime, absolute, changeFrequency)) {
				// switch animation
				if(model->agentType == AgentType::BLUE) {
					sprite.SetFrame(Modulo(1, 3, sprite.GetFrame()));
				} else {
					sprite.SetFrame(Modulo(5, 7, sprite.GetFrame()));
				}
			}
		}
	}
};
