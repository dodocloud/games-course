#pragma once

#include "AphMain.h"
#include "Renderable.h"
#include "GameObject.h"
#include "ArkanoidModel.h"
#include "AphApp.h"
#include "jsonxx.h"

class ArkanoidApp : public AphApp {
public:
	ArkanoidModel* model;
	// border of the root element
	FRect* rootBorder;
	
	jsonxx::Object gameConfig;

	/**
	 * Initializes the game
	 */
	void Init();

	/**
	 * Resets the game
	 */
	void Reset();

	/**
	 * Gets key that is mapped onto a given action
	 */
	virtual int GetMappedKey(StrId action);
};
