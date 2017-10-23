#pragma once

#include <string>
#include <map>
#include "StrId.h"
#include "Msg.h"

using namespace std;

class Component;
class GameObject;

class Scene {
private:
	string name;
	map<StrId, vector<Component*>> subscribers;
	// listeners ids and their registered actions
	map<int, vector<StrId>> subscribedActions;
	
	// all game objects of the scene
	vector<GameObject*> allGameObjects;

	GameObject* rootObject = nullptr;
public:

	Scene() {
		
	}

	Scene(string name) :name(name) {
		
	}

	string& GetName() {
		return name;
	}

	GameObject* GetRootObject() {
		return rootObject;
	}

	void SetRootObject(GameObject* obj) {
		this->rootObject = obj;
	}

	void SetName(string& name) {
		this->name = name;
	}

	void FindGameObjectsByFlag(unsigned flag, vector<GameObject*>& output);

	void FindGameObjectsByName(string name, vector<GameObject*>& output);

	GameObject* FindGameObjectByName(string name);

	void SendMsg(Msg& msg);

	friend class GameObject;
	friend class Component;

protected:
	void AddGameObjectInternal(GameObject* obj);

	void RemoveGameObjectInternal(GameObject* obj);

	void RegisterSubscriber(StrId action, Component* component);

	bool RemoveSubscriber(StrId action, Component* component);

	void RemoveSubscriber(Component* component);
};