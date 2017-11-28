#pragma once

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
 * Movemnt component for an agent
 */
class AgentAIMoveComponent : public FollowBehavior {
public:

	AgentAIMoveComponent() : FollowBehavior(new Path(), 15, 15, 5, 3) {
		
	}

	AIModel* gameModel;

	virtual void Init() {
		gameModel = owner->GetRoot()->GetAttr<AIModel*>(AI_MODEL);
		this->forceStrength = 0.25f;
		FollowBehavior::Init();
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		if(!PathFinished()) {
			FollowBehavior::Update(delta, absolute);
		}
	}

	/**
	 * Executes follow behavior
	 */
	void GoToPoint(Vec2i startPos, ofVec2f startLoc, Vec2i goal) {
		
		vector<Vec2i> directionPath;
		vector<Vec2i> foundpath;
		// 1) find path from start to goal
		gameModel->map.FindPath(startPos, goal, foundpath, directionPath);
		
		// 2) transform path from map-coords into world-coords
		vector<ofVec2f> locPath;
		gameModel->map.MapBlockToLocations(foundpath, locPath);

		// 3) add segments into followPath object
		path->AddFirstSegment(locPath[0], locPath[1]);

		for(int i=2; i<locPath.size(); i++) {
			path->AddSegment(locPath[i]);
		}

		// 4) start followBehavior
		ResetPath(path);;
	}
};