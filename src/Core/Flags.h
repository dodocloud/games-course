#pragma once

#include <map>
#include <vector>

using std::map;
using std::vector;

class StrId;

/**
* Structure for BIT indicators
* Flags can be widely used for any object that may be in several states at once
* To reduce memory it is recommended to use only flags between 0 and 128 since the
* higher flags are stored in a map
*
* This class may be used in combination with StrId
*/
class Flags {
private:
	// flag array between 0-32
	unsigned flags1 = 0;
	// flag array between 33-64
	unsigned flags2 = 0;
	// flag array between 65-96
	unsigned flags3 = 0;
	// flag array between 97-128
	unsigned flags4 = 0;
	// map for other flags (lazy initialization)
	map<unsigned, unsigned>* otherFlags = nullptr;


public:

	/**
	* Creates a new flag array
	*/
	Flags();

	/**
	* Creates a new flag array, initialized with list of states
	*/
	Flags(vector<unsigned>& states);

	/**
	* Creates a new flag array, initialized with one state
	*/
	Flags(unsigned state);

	/**
	* Creates a new flag array, initialized with one state
	*/
	Flags(StrId state);


	Flags(const Flags& obj);

	~Flags();

	/**
	* Gets list of all states
	*/
	vector<unsigned> GetAllStates() const;

	/**
	* Returns true, if a state is set
	*/
	bool HasState(unsigned state) const;

	/**
	* Sets the state
	* @param state state to set
	*/
	void SetState(unsigned state) {
		return DoStateOperation(true, state);
	}

	/**
	* Switches values of two states
	*/
	void SwitchState(unsigned state1, unsigned state2);

	/**
	* Resets the state
	* @param state state to reset
	*/
	void ResetState(unsigned state) {
		return DoStateOperation(false, state);
	}

	Flags& operator=(const unsigned& st1);
	Flags& operator=(const Flags& st1);
	bool operator==(unsigned st1);
	bool operator==(const Flags& st1);
	bool operator!=(unsigned st1);
	bool operator!=(const Flags& st1);
	Flags operator+(unsigned st1);
	Flags operator-(unsigned st2);
	Flags& operator+=(unsigned st1);
	Flags& operator-=(unsigned st1);

	/**
	* Returns true, if all states from the given flag array are set in this object
	*/
	bool Contains(Flags& other) const;

	/**
	* Returns true, if at least one state from the given flag array is set in this object
	*/
	bool ContainsAtLeastOne(Flags& other) const;

private:

	/**
	* Gets index of a state
	* @param state number of state
	*/
	int GetStateIndex(unsigned state) const {
		return state / sizeof(unsigned);
	}

	/**
	* Gets offset of a state
	* @param state number of state
	*/
	int GetStateOffset(unsigned state) const {
		return state % sizeof(unsigned);
	}

	/**
	* Does state operation (sets or resets the state)
	* @param set - if true, state will be set
	* @param state - state to set/reset
	*/
	void DoStateOperation(bool set, unsigned state);
};
