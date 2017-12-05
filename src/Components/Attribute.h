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
	bool isPointer;
	void* rawVal; // pointer to raw value
	bool isShared = false;
public:

	BaseAttribute(unsigned key, bool isPointer, void* rawVal, GameObject* owner, bool isShared) 
	: owner(owner), key(key), isPointer(isPointer), rawVal(rawVal), isShared(isShared) {

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

	bool IsPointer() const {
		return isPointer;
	}

	void* RawVal() const {
		return rawVal;
	}
};

/**
 * Helper that deletes only pointers
 */
template<typename T> class AttrDeleter {

public:

	static void Destroy(T &value) {
	}
};

template<typename P>
class AttrDeleter<P*> {

public:

	static void Destroy(P *value) {
		delete value;
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

	Attribute(unsigned key, T val, GameObject* owner, bool isShared = false)
		: BaseAttribute(key, std::is_pointer<T>(), 0, owner, isShared), value(val) {
		// must be set when its address is determined
		rawVal = &value;
	}

	~Attribute() {
		// remove dynamic attribute
		if(this->isPointer && !isShared) {
			AttrDeleter<T>::Destroy(value);
		}
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