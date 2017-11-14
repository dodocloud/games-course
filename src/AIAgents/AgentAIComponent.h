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
	AIWanderComponent* steeringComponent = new AIWanderComponent(10, 20, 123);
	Path* followPath = new Path();
	AgentState lastState = AgentState::IDLE;

	virtual void Init() {
		gameModel = owner->GetRoot()->GetAttr<AIModel*>(AI_MODEL);
		agentModel = owner->GetAttr<AgentModel*>(ATTR_AGENTMODEL);

		steeringComponent->SetOwner(owner);
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
		steeringComponent->Update(delta, absolute);
		return AgentState::IDLE;
	}

	AgentState ProcessGoingToLoadState(bool isEntering, uint64_t delta, uint64_t absolute) {
		return AgentState::IDLE;
	}

	AgentState ProcessGoingToUnloadState(bool isEntering, uint64_t delta, uint64_t absolute) {
		return AgentState::IDLE;
	}

	AgentState ProcessLoadingState(bool isEntering, uint64_t delta, uint64_t absolute) {
		return AgentState::IDLE;
	}

	AgentState ProcessUnloadingState(bool isEntering, uint64_t delta, uint64_t absolute) {
		return AgentState::IDLE;
	}

	// ============================================================================


	/**
	 * Selects a loading target and executes follow behavior
	 */
	void GoLoad() {
		
		vector<MapBlock> ores;
		gameModel->map.FindAllMapBlocks(MAP_BLOCK_ORE, ores);
		// choose a random iron ore
		MapBlock randomOre = ores[ofRandom(0, ores.size())];
		
		ofVec2f agentLocation = owner->GetMesh()->GetTransform().localPos;
		Vec2i agentMapPosition = gameModel->map.LocationToMapBlock(agentLocation);
		Vec2i orePosition = Vec2i(randomOre.x, randomOre.y);
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
		
		// =========== TODO ===========
		// 2) transform path from map-coords into world-coords
		// 3) add segments into followPath object
		// 4) start followBehavior

		
		// 5) Debugging: render the path
		// RenderPath(fullPath);
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
