#pragma once

#include "StrId.h"

class GameObject;


/**
* Messaging entity
*/
class Msg {
private:
	// identifier counter
	static int idCounter;
	// id of this message
	int id;
	// type of invoked action 
	StrId action;
	// sender id (-1 for entities without id)
	int senderId;
	// node that is connected with this message
	GameObject* contextNode = nullptr;
	// data payload
	void* data = nullptr;

public:

	Msg() {

	}

	/**
	* Creates a new message
	* @param action type of invoked action
	* @param senderId id of the sender
	* @param contextNode node that is connected with this message
	* @param data data payload
	*/
	Msg(StrId action, int senderId, GameObject* contextNode, void* data)
	: action(action), senderId(senderId),contextNode(contextNode),data(data) {
		
	}

	~Msg() {

	}

	/**
	* Gets type of action
	*/
	StrId GetAction() const {
		return action;
	}

	/**
	* Checkes whether the action is equal to given value
	*/
	bool HasAction(StrId actionCmp) const {
		return action == actionCmp;
	}

	/**
	* Sets the type of action
	*/
	void SetAction(StrId action) {
		this->action = action;
	}

	/**
	* Gets id of the sender
	*/
	int GetSenderId() const {
		return senderId;
	}

	/**
	* Sets id of the sender (-1 for nodes which are not part of the scene)
	*/
	void SetSenderId(int senderId) {
		this->senderId = senderId;
	}

	/**
	* Returns true, if this message has a context node
	*/
	bool HasContextNode() {
		return contextNode != nullptr;
	}

	/**
	* Gets the node that is connected with this message
	*/
	GameObject* GetContextNode() {
		return contextNode;
	}

	/**
	* Sets the node that is connected with this message
	*/
	void SetContextNode(GameObject* contextNode) {
		this->contextNode = contextNode;
	}


	/**
	* Gets data payload
	*/
	template <class T>
	T* GetData() {
		return dynamic_cast<T*>(data);
	}
};
