#pragma once

#include "AgentAIMoveComponent.h"
#include "SteeringComponent.h"
#include "StrId.h"
#include "Component.h"
#include "SteeringMath.h"
#include "AphMain.h"
#include "GameObject.h"
#include "AIModel.h"
#include "SteeringComponent.h"
#include "AIConstants.h"
#include "Scene.h"

/**
 * Behavior component for an agent
 */
class AgentAIComponent : public Component {
public:
	AIModel* gameModel;
	AgentModel* agentModel;
	AgentAIMoveComponent* moveComponent;
	int lastState = AGENT_STATE_IDLE;

	virtual void Init() {
		gameModel = owner->GetRoot()->GetAttr<AIModel*>(AI_MODEL);
		agentModel = owner->GetAttr<AgentModel*>(ATTR_AGENTMODEL);
		moveComponent = owner->GetComponent<AgentAIMoveComponent>();
	}

	virtual void OnMessage(Msg& msg) {

	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		auto state = agentModel->currentState;

		bool stateChange = state != lastState;

		switch(state) {
		case AGENT_STATE_IDLE:
			state = ProcessIdleState(stateChange, delta, absolute);
			break;
		case AGENT_STATE_GOING_TO_UNLOAD:
			state = ProcessGoingToUnloadState(stateChange, delta, absolute);
			break;
		case AGENT_STATE_GOING_TO_LOAD:
			state = ProcessGoingToLoadState(stateChange, delta, absolute);
			break;
		case AGENT_STATE_LOADING:
			state = ProcessLoadingState(stateChange, delta, absolute);
			break;
		case AGENT_STATE_UNLOADING:
			state = ProcessUnloadingState(stateChange, delta, absolute);
			break;
		}

		lastState = agentModel->currentState;
		// update current state
		agentModel->currentState = state;
	}

	// ================================= TODO =====================================
	int ProcessIdleState(bool isEntering, uint64_t delta, uint64_t absolute) {
		if(agentModel->IsLoaded()) {
			return AGENT_STATE_GOING_TO_UNLOAD;
		}else {
			return AGENT_STATE_GOING_TO_LOAD;
		}
	}

	int ProcessGoingToLoadState(bool isEntering, uint64_t delta, uint64_t absolute) {
		if(agentModel->IsLoaded()) {
			return AGENT_STATE_GOING_TO_UNLOAD;
		}
		
		if(isEntering) {
			GoLoad();
			return AGENT_STATE_GOING_TO_LOAD;
		}

		if(moveComponent->PathFinished()) {
			return AGENT_STATE_LOADING;
		}else {
			return AGENT_STATE_GOING_TO_LOAD;
		}
	}

	int ProcessGoingToUnloadState(bool isEntering, uint64_t delta, uint64_t absolute) {
		if (!agentModel->IsLoaded()) {
			return AGENT_STATE_GOING_TO_LOAD;
		}

		if (isEntering) {
			GoUnload();
			return AGENT_STATE_GOING_TO_UNLOAD;
		}

		if (moveComponent->PathFinished()) {
			return AGENT_STATE_UNLOADING;
		}
		else {
			return AGENT_STATE_GOING_TO_UNLOAD;
		}
	}

	int ProcessLoadingState(bool isEntering, uint64_t delta, uint64_t absolute) {
		if(agentModel->currentLoadingTime > agentModel->loadingDelay) {
			agentModel->currentLoadingTime = 0;
			agentModel->amount += 10;
			return AGENT_STATE_IDLE;
		}

		agentModel->currentLoadingTime += delta;

		return AGENT_STATE_LOADING;
	}

	int ProcessUnloadingState(bool isEntering, uint64_t delta, uint64_t absolute) {
		if (agentModel->currentLoadingTime > agentModel->loadingDelay) {
			agentModel->currentLoadingTime = 0;
			switch(agentModel->currentCargo) {
			case CARGO_TYPE_ORE:
				gameModel->warehouseModel.ironOre += agentModel->amount;
				gameModel->goingToLoadOre--;
				break;
			case CARGO_TYPE_PETROL:
				gameModel->warehouseModel.petrol += agentModel->amount;
				gameModel->goingToLoadPetrol--;
				break;
			}
			
			agentModel->amount = 0;
			return AGENT_STATE_IDLE;
		}

		agentModel->currentLoadingTime += delta;

		return AGENT_STATE_UNLOADING;
	}

	// ============================================================================


	/**
	 * Selects a loading target and executes follow behavior
	 */
	void GoLoad() {
		vector<MapBlock> ores;
		vector<MapBlock> petrols;
		gameModel->map.FindAllMapBlocks(MAP_BLOCK_ORE, ores);
		gameModel->map.FindAllMapBlocks(MAP_BLOCK_PETROL, petrols);

		int petrol = gameModel->warehouseModel.petrol;
		int ore = gameModel->warehouseModel.ironOre;
		
		int expectedPetrol = petrol + gameModel->goingToLoadPetrol * agentModel->capacity;
		int expectedOre = ore + gameModel->goingToLoadOre * agentModel->capacity;

		int expectedUnitsPetrol = expectedPetrol / gameModel->warehouseModel.agentPetrolCost;
		int expectedUnitsOre = expectedOre / gameModel->warehouseModel.agentIronCost;

		MapBlock selectedTarget;

		if(expectedUnitsPetrol > expectedUnitsOre) {
			selectedTarget = ores[ofRandom(0, ores.size())];
		}else {
			selectedTarget = petrols[ofRandom(0, petrols.size())];
		}

		ofVec2f agentLocation = owner->GetRenderable()->GetTransform().localPos;
		Vec2i agentMapPosition = gameModel->map.LocationToMapBlock(agentLocation);
		Vec2i orePosition = Vec2i(selectedTarget.x, selectedTarget.y);

		if(selectedTarget.type == MAP_BLOCK_PETROL) {
			agentModel->currentCargo = CARGO_TYPE_PETROL;
			gameModel->goingToLoadPetrol++;
		}else {
			agentModel->currentCargo = CARGO_TYPE_ORE;
			gameModel->goingToLoadOre++;
		}

		moveComponent->GoToPoint(agentMapPosition, agentLocation, orePosition);
	}

	/**
	 * Selects an unloading target and executes follow behavior
	 */
	void GoUnload() {
		ofVec2f agentLocation = owner->GetRenderable()->GetTransform().localPos;
		Vec2i agentMapPosition = gameModel->map.LocationToMapBlock(agentLocation);
		Vec2i warehousePosition = gameModel->map.FindNearestMapBlock(agentMapPosition, MAP_BLOCK_WAREHOUSE);
		moveComponent->GoToPoint(agentMapPosition, agentLocation, warehousePosition);
	}
};