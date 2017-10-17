#pragma once

#include "Msg.h"

class GameObject;

/**
 * Game component
 */
class Component {
protected:
	// owner of this component
	GameObject* owner;
	// incremental counter
	static int idCounter; 
	int id;
	bool enabled = true;
public:

	Component() {
		this->id = idCounter++;
	}

	virtual ~Component() {

	}

	int GetId() {
		return id;
	}

	GameObject* GetOwner() {
		return owner;
	}

	void SetOwner(GameObject* owner) {
		this->owner = owner;
	}

	/**
	 * Initialization procedure; invoked when the component is attached to the game object
	 */
	virtual void Init() {
		
	}

	/**
	 * Message handler
	 */
	virtual void OnMessage(Msg& msg) {
		
	}


	virtual void Update(uint64_t delta, uint64_t absolute) = 0;

	bool IsEnabled() {
		return enabled;
	}

	void SetIsEnabled(bool enabled) {
		this->enabled = enabled;
	}

protected:
	
	/**
	 * Registers itself as a subscriber of given action
	 */
	void RegisterSubscriber(StrId action);

	/**
	 * Sends message to all subscribers
	 */
	void SendMsg(StrId action);

	void SendMsg(StrId action, void* data);
	
	void SendMsg(Msg& msg);
};