#pragma once

#include "Component.h"
#include "CompValues.h"
#include "TransformBuilder.h"
#include "ParatrooperModel.h"
#include "GameValues.h"

/**
 * Component that plays sounds based on incoming events
 */
class SoundComponent : public Component {
public:

	virtual void Init() {
		RegisterSubscriber(PROJECTILE_SHOT);
		RegisterSubscriber(GAME_OVER);
		RegisterSubscriber(UNIT_KILLED);
	}

	virtual void OnMessage(Msg& msg) {
		// can't be simpler
		if(msg.GetAction() == PROJECTILE_SHOT) {
			owner->GetContext()->PlaySound(FILE_SOUND_FIRE);
		}else if(msg.GetAction() == GAME_OVER) {
			owner->GetContext()->PlaySound(FILE_SOUND_GAMEOVER);
		}else if(msg.GetAction() == UNIT_KILLED) {
			owner->GetContext()->PlaySound(FILE_SOUND_KILL);
		}
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		
	}
};