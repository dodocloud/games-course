#pragma once

#include "Component.h"
#include "CompValues.h"
#include "TransformBuilder.h"
#include "GameManager.h"
#include "DeathAnimation.h"

/**
 * Component that watches killed units, executes flickering animation and removes
 * them from the scene
 */
class DeathChecker : public Component {

public:
	map<int, Component*> pendingAnimations;

	virtual void Init() {
		RegisterSubscriber(UNIT_KILLED);
		RegisterSubscriber(ANIMATION_ENDED);
	}

	virtual void OnMessage(Msg& msg) {
		if(msg.GetAction() == UNIT_KILLED) {
			// create a flickering animation
			auto node = msg.GetData<GameObject>();
			auto anim = new DeathAnimation();
			node->AddComponent(anim);
			pendingAnimations[anim->GetId()] = anim;
			ofLogNotice("DeathChecker", "%s killed", node->GetName().c_str());
		} else if(msg.GetAction() == ANIMATION_ENDED) {
			// flickering animation ended -> remove the unit from the scene
			auto found = pendingAnimations.find(msg.GetSenderId());
			if(found != pendingAnimations.end()) {
				msg.GetContextNode()->Remove();
			}
		}
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		
	}
};
