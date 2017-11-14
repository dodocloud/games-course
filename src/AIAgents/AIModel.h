#pragma once

#include "AIMap.h"


/**
 * Model for warehouse
 */
struct WarehouseModel {
	// agent building time in ms
	int buildDelay = 7000;
	// building time of current agent
	uint64_t currentBuildTime = 6000; // immediately spawn the first agent
	// indicator whether the warehouse is building any agent
	bool isBuilding = true;

	// current amount of petrol
	int petrol = 30;
	// current amount of ore
	int ironOre = 10;

	// warehouse position
	Vec2i position;

	// how much petrol does one agent cost
	int agentPetrolCost = 10;
	// how much iron does one agent cost
	int agentIronCost = 10;
};

/**
 * Global game model
 */
class AIModel {
public:
	// pointer to sprite sheet
	SpriteSheet* spriteSheet;
	
	AIMap map;

	// number of agents on the map
	int agentsNum = 0;

	WarehouseModel warehouseModel;
};


enum class AgentState {
	IDLE, GOING_TO_LOAD, GOING_TO_UNLOAD, LOADING, UNLOADING
};

enum class AgentType {
	RED, BLUE
};

enum class CargoType {
	NONE, ORE, PETROL
};

/**
 * Model for an agent
 */
struct AgentModel {
	AgentType agentType;
	AgentState currentState = AgentState::IDLE;
	CargoType currentCargo = CargoType::NONE;
	
	// loaded amount of cargo
	int amount = 0;
	// max capacity of cargo
	int capacity = 10;
	
	// max speed
	int speed = 0;

	// un/loading time in ms
	uint64_t currentLoadingTime = 0;
	// how long does it take to load a cargo
	int loadingDelay = 3000;

	bool IsLoaded() const {
		return amount != 0 && currentState != AgentState::LOADING;
	}
};