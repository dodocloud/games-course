#include "Scene.h"
#include "GameObject.h"
#include "Component.h"
#include "CompValues.h"

void Scene::FindGameObjectsByFlag(unsigned flag, vector<GameObject*>& output) {
	for (auto gameObj : allGameObjects) {
		if (gameObj->HasFlag(flag)) {
			output.push_back(gameObj);
		}
	}
}

void Scene::FindGameObjectsByName(string name, vector<GameObject*>& output) {
	// linear search :-(
	for(auto gameObj : allGameObjects) {
		if(gameObj->GetName() == name) {
			output.push_back(gameObj);
		}
	}
}

GameObject* Scene::FindGameObjectByName(string name) {
	for (auto gameObj : allGameObjects) {
		if (gameObj->GetName() == name) {
			return gameObj;
		}
	}
	return nullptr;
}

GameObject* Scene::FindGameObjectByNetworkId(int id) {
	for (auto gameObj : allGameObjects) {
		if (gameObj->GetNetworkId() == id) {
			return gameObj;
		}
	}
	return nullptr;
}


void Scene::SendMsg(Msg& msg) {
	auto registeredSubs = subscribers.find(msg.GetAction());

	if(registeredSubs != subscribers.end()) {
		for(auto& subscriber : registeredSubs->second) {
			// don't send messages to itself
			if (subscriber->GetId() != msg.GetSenderId()) {
				subscriber->OnMessage(msg);
			}
		}
	}
}


void Scene::AddGameObjectInternal(GameObject* obj) {
	if (find(allGameObjects.begin(), allGameObjects.end(), obj) == allGameObjects.end()) {
		allGameObjects.push_back(obj);
		// send event
		Msg msg(OBJECT_ADDED, obj->GetId(), obj, nullptr);
		SendMsg(msg);
	}
}

void Scene::RemoveGameObjectInternal(GameObject* obj) {
	auto foundObj = find(allGameObjects.begin(), allGameObjects.end(), obj);
	if(foundObj != allGameObjects.end()) {
		allGameObjects.erase(foundObj);
		// send event
		Msg msg(OBJECT_REMOVED, obj->GetId(), obj, nullptr);
		SendMsg(msg);
	}
}

void Scene::RegisterSubscriber(StrId action, Component* component) {
	if (subscribers.count(action) == 0) {
		subscribers[action] = vector <Component*>();
	}

	vector<Component*>& listeners = subscribers[action];

	if (find(listeners.begin(), listeners.end(), component) == listeners.end()) {
		listeners.push_back(component);
	}

	auto& msgAction = subscribedActions[component->GetId()];

	if (find(msgAction.begin(), msgAction.end(), action) == msgAction.end()) {
		msgAction.push_back(action);
	}
}

bool Scene::RemoveSubscriber(StrId action, Component* subscriber) {
	if (subscribers.count(action) != 0) {
		vector<Component*>& listeners = subscribers[action];

		for (auto it = listeners.begin(); it != listeners.end(); ++it) {
			if ((*it)->GetId() == subscriber->GetId()) {
				listeners.erase(it);
				return true;
			}
		}
	}
	return false;
}

void Scene::RemoveSubscriber(Component* subscriber) {

	auto found = subscribedActions.find(subscriber->GetId());

	if (found != subscribedActions.end()) {

		vector<StrId> actions = found->second;

		// unregister all actions
		for (auto action : actions) {
			RemoveSubscriber(action, subscriber);
		}

		// remove from the second collection
		subscribedActions.erase(subscriber->GetId());
	}
}
