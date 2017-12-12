#pragma once

#include "AIMap.h"

enum class AIAgentGameType {
	CLASSIC, MULTIPLAYER_CLIENT, MULTIPLAYER_HOST
};

/**
 * Model for warehouse
 */
struct WarehouseModel {
	// agent building time in ms
	int buildDelay = 7000;
	// building time of current agent
	unsigned currentBuildTime = 6000; // immediately spawn the first agent
	// indicator whether the warehouse is building any agent
	bool isBuilding = true;

	// current amount of petrol
	int petrol = 400;
	// current amount of ore
	int ironOre = 300;

	// warehouse position
	Vec2i position;

	// how much petrol does one agent cost
	int agentPetrolCost = 10;
	// how much iron does one agent cost
	int agentIronCost = 30;
};

/**
 * Global game model
 */
class AIModel  {
public:
	AIAgentGameType networkingType = AIAgentGameType::CLASSIC;
	int goingToLoadOre = 0;
	int goingToLoadPetrol = 0;

	// pointer to sprite sheet
	SpriteSheet* spriteSheet;
	
	AIMap map;

	// number of agents on the map
	int agentsNum = 0;

	WarehouseModel warehouseModel;

	WarehouseModel& GetWarehouseModel() {
		return warehouseModel;
	}

	AIMap& GetMap() {
		return map;
	}
};

#define AGENT_STATE_IDLE 0
#define AGENT_STATE_GOING_TO_LOAD 1
#define AGENT_STATE_GOING_TO_UNLOAD 2
#define AGENT_STATE_LOADING 3
#define AGENT_STATE_UNLOADING 4

#define AGENT_TYPE_RED 1
#define AGENT_TYPE_BLUE 2

#define CARGO_TYPE_ORE 1
#define CARGO_TYPE_PETROL 2


/**
 * Model for an agent
 */
class AgentModel  {
public:

	int agentType;
	int currentState = AGENT_STATE_IDLE;
	int currentCargo = CARGO_TYPE_ORE;


	// loaded amount of cargo
	int amount = 0;
	// max capacity of cargo
	int capacity = 10;
	
	// max speed
	int speed = 0;

	// un/loading time in ms
	unsigned currentLoadingTime = 0;
	// how long does it take to load a cargo
	int loadingDelay = 3000;

	bool IsLoaded() const {
		return amount != 0 && currentState != AGENT_STATE_LOADING;
	}
};
