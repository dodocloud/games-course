#pragma once

#include "StrId.h"
#include "GameObject.h"
#include "ArkanoidConstants.h"

/**
 * Component that only plays sounds according to the incoming events
 */
class ArkanoidSoundComponent : public Component {
public:

	virtual void Init() {
		RegisterSubscriber(ARK_EVENT_GAME_STARTED);
		RegisterSubscriber(ARK_EVENT_ROUND_STARTED);
		RegisterSubscriber(ARK_EVENT_OBJECT_HIT);
		RegisterSubscriber(ARK_EVENT_GAME_OVER);
		RegisterSubscriber(ARK_EVENT_LEVEL_COMPLETED);
		RegisterSubscriber(ARK_EVENT_LEVEL_STARTED);
		RegisterSubscriber(ARK_EVENT_GAME_COMPLETED);
	}

	virtual void OnMessage(Msg& msg) {
		if(msg.GetAction() == ARK_EVENT_ROUND_STARTED) {
			owner->GetContext()->PlaySound(FILE_SOUND_ROUND);
		}else if(msg.GetAction() == ARK_EVENT_OBJECT_HIT) {
			owner->GetContext()->PlaySound(FILE_SOUND_HIT);
		}else if(msg.GetAction() == ARK_EVENT_GAME_OVER) {
			owner->GetContext()->PlaySound(FILE_SOUND_GAME_OVER);
		}else if(msg.GetAction() == ARK_EVENT_LEVEL_COMPLETED) {
			owner->GetContext()->PlaySound(FILE_SOUND_GAME_OVER); 
		} else if (msg.GetAction() == ARK_EVENT_LEVEL_STARTED) {
			owner->GetContext()->PlaySound(FILE_SOUND_ROUND); 
		} else if (msg.GetAction() == ARK_EVENT_GAME_STARTED) {
			owner->GetContext()->PlaySound(FILE_SOUND_GAME_START);
		} else if (msg.GetAction() == ARK_EVENT_GAME_COMPLETED) {
			owner->GetContext()->PlaySound(FILE_SOUND_GAME_OVER);
		}
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		
	}
};