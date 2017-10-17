#pragma once


class GameObject;

/**
* Base attribute
*
*/
class BaseAttribute {
protected:
	// owner node
	GameObject* owner;
	// key identifier
	const unsigned key;

public:

	BaseAttribute(unsigned key, GameObject* owner) 
	: owner(owner), key(key) {

	}

	virtual ~BaseAttribute() {

	}

	/**
	* Gets owner node
	*/
	const GameObject* GetOwner() const {
		return owner;
	}

	/**
	* Gets key identifier
	*/
	unsigned GetKey() const {
		return key;
	}
};


/**
* Attribute generic wrapper
*
*/
template <class  T>
class Attribute : public BaseAttribute {
protected:
	T value;

public:

	Attribute(unsigned key, T val, GameObject* owner)
		: BaseAttribute(key, owner), value(val) {

	}

	~Attribute() {

	}

	/**
	* Gets reference to the attribute value
	*/
	T& Get() {
		return (value);
	}

	/**
	* Sets attribute value
	*/
	void Set(T& val) {
		this->value = val;
	}
};
