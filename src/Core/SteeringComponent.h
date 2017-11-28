#pragma once

#include "SteeringComponent.h"
#include "StrId.h"
#include "Component.h"
#include "SteeringMath.h"
#include "AphMain.h"

// string ids
extern char WANDER_DEST[];
extern char ATTR_DYNAMICS[];
extern char ATTR_STEERING_BEH_DEST[];



/**
* Behavior for movement, updates transformations according
* to the Movement attribute
*/
class DynamicsComponent : public Component {
public:
	virtual void Init();

	virtual void OnMessage(Msg& msg) {

	}

	virtual void Update(uint64_t delta, uint64_t absolute);
};

/**
* Simple movement that randomly changes direction
*/
class SimpleMoveComponent : public Component {
	virtual void Init();

	virtual void OnMessage(Msg& msg) {

	}

	virtual void Update(uint64_t delta, uint64_t absolute);
};

class SteeringComponent : public Component {
protected:
	SteeringMath steeringMath;
	float ClampAngle(float x);

	void SetRotationDirection(Dynamics* dynamics, Trans& transform, ofVec2f destination, float maxAcceleration, uint64 delta);
};

/**
* Steering behavior for more sophisticated random movement
*/
class WanderComponent : public SteeringComponent {
private:
	// radius of the wandering circle
	float wanderRadius = 0;
	// distance of the wandering circle
	float wanderDistance = 0;
	// randomness of the point on the circle
	float wanderJitter = 0;
	StrId forceId;
public:

	WanderComponent(float wanderRadius, float wanderDistance, float wanderJitter)
		:wanderRadius(wanderRadius), wanderDistance(wanderDistance), wanderJitter(wanderJitter) {

	}

	virtual void Init();

	virtual void OnMessage(Msg& msg) {

	}

	virtual void Update(uint64_t delta, uint64_t absolute);
};

/**
 * Steering behavior for following
 */
class FollowBehavior : public SteeringComponent {
protected:
	Path* path;
	int currentPathIndex = 0;
	float maxRadialAcceleration = 0;
	// indicates how far from checkpoint may the character go
	float pointTolerance = 0;
	// indicates how far from the last checkpoint may the character stop
	float finalPointTolerance = 0;
	StrId forceId;
	StrId attrMovement = StrId(ATTR_DYNAMICS);
	bool pathFinished = false;
public:
	float maxAcceleration = 0;
	float forceStrength = 1;

	/**
	* Creates a new follow behavior
	* @param path path to follow
	* @param maxAcceleration maximum acceleration
	* @param maxRadialAcceleration maximum radial acceleration
	* @param pointTolerance indicates how far from checkpoint may the character go
	* @param finalPointTolerance indicates how far from the last checkpoint may the character stop
	*/
	FollowBehavior(Path* path, float maxAcceleration, float maxRadialAcceleration, float pointTolerance, float finalPointTolerance)
		: path(path), maxAcceleration(maxAcceleration), maxRadialAcceleration(maxRadialAcceleration),
		pointTolerance(pointTolerance), finalPointTolerance(finalPointTolerance) {
		forceId = StrId(this->GetId());
	}

	void ResetPath(Path* path) {
		this->path = path;
		this->currentPathIndex = 0;
		this->pathFinished = false;
	}

	bool PathFinished() const{
		return pathFinished || path->GetSegments().size() < 2;
	}

	void Init();

	void Update(uint64_t delta, uint64_t absolute);
};
