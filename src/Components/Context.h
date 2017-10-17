#pragma once

#include <set>
using namespace std;

/**
 * Global context that can be attached to all game objects.
 * May provide access to some enviromental attributes
 */
class Context {
public:
	/**
	 * Gets currently pressed keys
	 */
	virtual set<int>& GetPressedKeys() = 0;

	// todo place all environment methods here
};