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

	virtual int GetVirtualWidth() = 0;

	virtual int GetVirtualHeight() = 0;

	/**
	* Gets default scale of all meshes (images)
	*/
	virtual float GetMeshDefaultScale() = 0;

	// every movement equation should consider this value, because
	// the game scene is usually scaled
	virtual float GetGameSpeed() = 0;

	virtual ofImage* GetImage(string path) = 0;

	virtual void ResetGame() = 0;

	virtual void PlaySound(string path) = 0;

	virtual int GetMappedKey(StrId action) = 0;

	virtual bool IsKeyPressed(StrId action) {
		return GetPressedKeys().find(GetMappedKey(action)) != GetPressedKeys().end();
	}

	// todo place all environment methods here
};