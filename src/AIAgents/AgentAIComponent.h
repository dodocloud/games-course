#pragma once

#include "SteeringComponent.h"
#include "StrId.h"
#include "Component.h"
#include "SteeringMath.h"
#include "AphMain.h"
#include "GameObject.h"
#include "AIAgentsApp.h"
#include "AIModel.h"
#include "SteeringComponent.h"
#include "AIConstants.h"

/**
 * Behavior component for an agent
 */
class AgentAIComponent : public Component {
public:
	AIModel* gameModel;
	AgentModel* agentModel;

	// steering behavior used to move around the environment
	Path* followPath = new Path();
	FollowBehavior* steeringComponent = new FollowBehavior(nullptr, 15, 15, 5, 3);

	AgentState lastState = AgentState::IDLE;

	virtual void Init() {
		gameModel = owner->GetRoot()->GetAttr<AIModel*>(AI_MODEL);
		agentModel = owner->GetAttr<AgentModel*>(ATTR_AGENTMODEL);

		steeringComponent->SetOwner(owner);
		steeringComponent->forceStrength = 0.25f;
		steeringComponent->Init();
	}

	virtual void OnMessage(Msg& msg) {

	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		auto state = agentModel->currentState;

		bool stateChange = state != lastState;

		switch(state) {
		case AgentState::IDLE:
			state = ProcessIdleState(stateChange, delta, absolute);
			break;
		case AgentState::GOING_TO_UNLOAD:
			state = ProcessGoingToUnloadState(stateChange, delta, absolute);
			break;
		case AgentState::GOING_TO_LOAD:
			state = ProcessGoingToLoadState(stateChange, delta, absolute);
			break;
		case AgentState::LOADING:
			state = ProcessLoadingState(stateChange, delta, absolute);
			break;
		case AgentState::UNLOADING:
			state = ProcessUnloadingState(stateChange, delta, absolute);
			break;
		}

		lastState = agentModel->currentState;
		// update current state
		agentModel->currentState = state;
	}

	// ================================= TODO =====================================
	AgentState ProcessIdleState(bool isEntering, uint64_t delta, uint64_t absolute) {
		if(agentModel->IsLoaded()) {
			return AgentState::GOING_TO_UNLOAD;
		}else {
			return AgentState::GOING_TO_LOAD;
		}
	}

	AgentState ProcessGoingToLoadState(bool isEntering, uint64_t delta, uint64_t absolute) {
		if(agentModel->IsLoaded()) {
			return AgentState::GOING_TO_UNLOAD;
		}
		
		if(isEntering) {
			GoLoad();
			return AgentState::GOING_TO_LOAD;
		} else {
			steeringComponent->Update(delta, absolute);
		}

		if(steeringComponent->PathFinished()) {
			return AgentState::LOADING;
		}else {
			return AgentState::GOING_TO_LOAD;
		}
	}

	AgentState ProcessGoingToUnloadState(bool isEntering, uint64_t delta, uint64_t absolute) {
		if (!agentModel->IsLoaded()) {
			return AgentState::GOING_TO_LOAD;
		}

		if (isEntering) {
			GoUnload();
			return AgentState::GOING_TO_UNLOAD;
		}else {
			steeringComponent->Update(delta, absolute);
		}

		if (steeringComponent->PathFinished()) {
			return AgentState::UNLOADING;
		}
		else {
			return AgentState::GOING_TO_UNLOAD;
		}
	}

	AgentState ProcessLoadingState(bool isEntering, uint64_t delta, uint64_t absolute) {
		if(agentModel->currentLoadingTime > agentModel->loadingDelay) {
			agentModel->currentLoadingTime = 0;
			agentModel->amount += 10;
			return AgentState::IDLE;
		}

		agentModel->currentLoadingTime += delta;

		return AgentState::LOADING;
	}

	AgentState ProcessUnloadingState(bool isEntering, uint64_t delta, uint64_t absolute) {
		if (agentModel->currentLoadingTime > agentModel->loadingDelay) {
			agentModel->currentLoadingTime = 0;
			switch(agentModel->currentCargo) {
			case CargoType::NONE:
				break;
			case CargoType::ORE:
				gameModel->warehouseModel.ironOre += agentModel->amount;
				gameModel->goingToLoadOre--;
				break;
			case CargoType::PETROL:
				gameModel->warehouseModel.petrol += agentModel->amount;
				gameModel->goingToLoadPetrol--;
				break;
			}
			
			agentModel->amount = 0;
			return AgentState::IDLE;
		}

		agentModel->currentLoadingTime += delta;

		return AgentState::UNLOADING;
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

		ofVec2f agentLocation = owner->GetMesh()->GetTransform().localPos;
		Vec2i agentMapPosition = gameModel->map.LocationToMapBlock(agentLocation);
		Vec2i orePosition = Vec2i(selectedTarget.x, selectedTarget.y);

		if(selectedTarget.type == MAP_BLOCK_PETROL) {
			agentModel->currentCargo = CargoType::PETROL;
			gameModel->goingToLoadPetrol++;
		}else {
			agentModel->currentCargo = CargoType::ORE;
			gameModel->goingToLoadOre++;
		}

		GoToPoint(agentMapPosition, agentLocation, orePosition);
	}

	/**
	 * Selects an unloading target and executes follow behavior
	 */
	void GoUnload() {
		ofVec2f agentLocation = owner->GetMesh()->GetTransform().localPos;
		Vec2i agentMapPosition = gameModel->map.LocationToMapBlock(agentLocation);
		Vec2i warehousePosition = gameModel->map.FindNearestMapBlock(agentMapPosition, MAP_BLOCK_WAREHOUSE);
		GoToPoint(agentMapPosition, agentLocation, warehousePosition);
	}

	/**
	 * Executes follow behavior
	 */
	void GoToPoint(Vec2i startPos, ofVec2f startLoc, Vec2i goal) {
		
		vector<Vec2i> directionPath;
		vector<Vec2i> path;
		// 1) find path from start to goal
		gameModel->map.FindPath(startPos, goal, path, directionPath);
		
		// 2) transform path from map-coords into world-coords
		vector<ofVec2f> locPath;
		gameModel->map.MapBlockToLocations(directionPath, locPath);

		// 3) add segments into followPath object
		followPath->AddFirstSegment(locPath[0], locPath[1]);

		for(int i=2; i<locPath.size(); i++) {
			followPath->AddSegment(locPath[i]);
		}

		// 4) start followBehavior
		steeringComponent->ResetPath(followPath);
		
		// 5) Debugging: render the path
		RenderPath(path);
	}


	// ============== FOR DEBUGGING PURPOSES =================

	vector<Sprite*> pathSprites;
	GameObject* paths = nullptr;

	void RenderPath(vector<Vec2i>& path) {

		if(paths == nullptr) {
			// find object that keeps path points
			paths = owner->GetScene()->FindGameObjectByName("mappaths");
		}

		for(auto spr : pathSprites) {
			paths->GetMesh<MultiSpriteMesh>()->RemoveSprite(spr, true);
		}
		pathSprites.clear();

		for(auto loc : path) {
			Sprite* spr = new Sprite(gameModel->spriteSheet, 13);
			spr->GetTransform().localPos = ofVec2f(loc.x * spr->GetWidth(), loc.y * spr->GetHeight());
			spr->GetTransform().localPos.z = 200;
			paths->GetMesh<MultiSpriteMesh>()->AddSprite(spr);
			pathSprites.push_back(spr);
		}
		paths->GetMesh<MultiSpriteMesh>()->Recalc();
	}
};
