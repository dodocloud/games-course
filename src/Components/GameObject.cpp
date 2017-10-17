#include "GameObject.h"
#include "Scene.h"
int GameObject::idCounter = 0;


GameObject* GameObject::GetRoot() {
	if (parent == nullptr) return this;
	if (parent->parent == nullptr) return parent;

	auto currentNode = parent;

	while (currentNode->parent != nullptr) {
		currentNode = currentNode->parent;
	}

	return currentNode;
}

void GameObject::AddComponent(Component* component) {
	this->components.push_back(component);
	component->SetOwner(this);
	component->Init(); // initialize component
}

bool GameObject::RemoveComponent(Component* component) {
	auto found = std::find(components.begin(), components.end(), component);

	if (found != components.end()) {
		component->SetOwner(nullptr);
		scene->RemoveSubscriber(component);
		components.erase(found);
		return true;
	}

	return false;
}

void GameObject::RemoveAllComponents() {
	for (auto comp : components) {
		RemoveComponent(comp);
	}

	components.clear();
}

bool GameObject::DestroyComponent(Component* component) {
	bool result = RemoveComponent(component);
	if (result) { delete component; }
	return result;
}

void GameObject::DestroyAllComponents() {
	for (auto comp : components) {
		DestroyComponent(comp);
	}

	components.clear();
}

void GameObject::AddChild(GameObject* child) {
	child->SetParent(this);

	if (isUpdating) {
		childrenToAdd.push_back(child);
	}
	else {
		this->children.push_back(child);
		scene->AddGameObjectInternal(child);
	}
}

bool GameObject::RemoveChild(GameObject* child) {

	auto found = std::find(children.begin(), children.end(), child);

	if (found != children.end()) {
		if (isUpdating) {
			childrenToRemove.push_back(child);
		}
		else {
			child->SetParent(nullptr);
			children.erase(found);
			scene->RemoveGameObjectInternal(child);
		}
		return true;
	}

	return false;
}

bool GameObject::DestroyChild(GameObject* child) {
	bool result = RemoveChild(child);
	if (result) { delete child; }
	return result;
}

void GameObject::RemoveAllChildren() {
	for (auto child : children) {
		RemoveChild(child);
	}
}

void GameObject::DestroyAllChildren() {
	for (auto child : children) {
		DestroyChild(child);
	}
}

void GameObject::Update(uint64_t delta, uint64_t absolute) {
	isUpdating = true;
	// update components
	for (auto comp : components) {
		comp->Update(delta, absolute);
	}

	// update children
	for (auto child : children) {
		child->Update(delta, absolute);
	}
	isUpdating = false;

	for(auto child : childrenToAdd) {
		AddChild(child);
	}

	for(auto child : childrenToRemove) {
		RemoveChild(child);
	}

	childrenToAdd.clear();
	childrenToRemove.clear();
}

void GameObject::UpdateTransformations() {

	if (parent != nullptr) {
		GetTransform().CalcAbsTransform(parent->GetTransform());
	}

	for (auto child : children) {
		child->UpdateTransformations();
	}
}


bool GameObject::RemoveAttr(StrId key, bool destroy) {
	auto it = attributes.find(key);

	if (it != attributes.end()) {
		BaseAttribute* attr = it->second;
		attributes.erase(it);
		if (destroy) delete attr;
		return true;
	}
	return false;
}

void GameObject::RemoveAllAttributes() {
	attributes.clear();
}

void GameObject::DestroyAllAttributes() {
	for (auto attr : attributes) {
		delete attr.second;
	}

	attributes.clear();
}