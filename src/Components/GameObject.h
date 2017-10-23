#pragma once

#include <string>
#include <vector>
#include "Transform.h"
#include "Sprite.h"
#include "Flags.h"
using namespace std;
#include "Renderable.h"
#include "Component.h"
#include "Attribute.h"
#include "Context.h"

class Scene;


/**
* Game object, structured in a tree hierarchy
*/
class GameObject {
protected:
	static int idCounter;
	int id;
	Renderable* mesh = nullptr;
	GameObject* parent = nullptr;
	Flags flags;
	vector<GameObject*> children;
	vector<Component*> components;			// list of components
	map<StrId, BaseAttribute*> attributes;  // list of attributes
	Context* context;
	Scene* scene;
	bool isUpdating = false;
	// children shouldn't be added nor removed while updating
	vector<GameObject*> childrenToAdd;
	vector<GameObject*> childrenToRemove;
	string name = "";
public:


	GameObject(Context* context, Scene* scene) : id(idCounter++), context(context), scene(scene), mesh(new Rect(0, 0)) { }

	GameObject(string name, Context* context, Scene* scene) : id(idCounter++), name(name), context(context), scene(scene), mesh(new Rect(0, 0)) { }

	GameObject(Context* context, Scene* scene, Renderable* mesh) : id(idCounter++), context(context), scene(scene), mesh(mesh) { }

	GameObject(string name, Context* context, Scene* scene, Renderable* mesh) : id(idCounter++), name(name), context(context), scene(scene), mesh(mesh) {}

	~GameObject() {
		DestroyAllComponents();

		for(auto child : children) {
			delete child;
		}

		delete mesh;
	}

	int GetId() {
		return id;
	}

	string& GetName() {
		return name;
	}

	void SetName(string name) {
		this->name = name;
	}

	Trans& GetTransform() const {
		return mesh->GetTransform();
	}

	void SetTransform(Trans& transform) {
		mesh->SetTransform(transform);
	}
	
	Context* GetContext() const {
		return this->context;
	}

	GameObject* GetParent() const {
		return this->parent;
	}

	GameObject* GetParent(string name) {
		if (this->name == name) return this;
		if (parent->name == name) return parent;
		if (parent->parent->name == name) return parent->parent;

		auto currentNode = parent;

		while (currentNode != nullptr && currentNode->name != name) {
			currentNode = currentNode->parent;
		}

		return currentNode;
	}

	void SetParent(GameObject* parent) {
		this->parent = parent;
	}

	/**
	* Sets states of this node
	*/
	void SetFlags(Flags val);

	/**
	* Returns true, if this object has the selected state
	*/
	bool HasFlag(unsigned state) const;

	/**
	* Sets a new state
	*/
	void SetFlag(unsigned state);

	/**
	* Resets the selected state
	*/
	void ResetFlag(unsigned state);

	/**
	* Switches values of two states
	*/
	void SwitchFlag(unsigned state1, unsigned state2);
	
	/**
	 * Finds the topmost element in the object hierarchy
	 */
	GameObject* GetRoot();

	void Remove();

	Scene* GetScene() {
		return scene;
	}

	Renderable* GetMesh() {
		return mesh;
	}

	template<typename T>
	T* GetMesh() {
		return dynamic_cast<T*>(mesh);
	}

	vector<GameObject*>& GetChildren() {
		return this->children;
	}

	void AddComponent(Component* component);

	bool RemoveComponent(Component* component);

	void RemoveAllComponents();

	bool DestroyComponent(Component* component);

	void DestroyAllComponents();

	void AddChild(GameObject* child);

	bool RemoveChild(GameObject* child);

	bool DestroyChild(GameObject* child);

	void RemoveAllChildren();

	void DestroyAllChildren();

	void Update(uint64_t delta, uint64_t absolute);

	/**
	 * Recursively updates all transformations
	 */
	void UpdateTransformations();

	/**
	* Adds a new attribute or replaces already existing attribute
	* @param key key of the attribute
	* @param value reference
	*/
	template<class T> void AddAttr(StrId key, T value) {
		RemoveAttr(key, true);

		attributes[key] = new Attribute<T>(key, value, this);
	}

	bool HasAttr(StrId key) {
		return attributes.count(key) != 0;
	}

	bool RemoveAttr(StrId key, bool destroy);

	void RemoveAllAttributes();

	void DestroyAllAttributes();

	/**
	* Gets an attribute by its key
	*/
	template<class T> T& GetAttr(StrId key) {
		auto it = attributes.find(key);
		Attribute<T>* attr = static_cast<Attribute<T>*>(it->second);
		return attr->Get();
	}

	/**
	* Changes value of selected attribute or adds a new attribute if this one doesn't exist
	*/
	template<class T> void ChangeAttr(StrId key, T value) {
		auto it = attributes.find(key);
		if (it != attributes.end()) {
			Attribute<T>* attr = static_cast<Attribute<T>*>(it->second);
			attr->Set(value);
		}
		else {
			AddAttr(key, value);
		}
	}
};