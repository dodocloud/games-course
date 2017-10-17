#pragma once

#include "AphMain.h"
#include "Renderable.h"
#include "GameObject.h"
#include "Renderer.h"
#include "TransformBuilder.h"
#include "Context.h"
#include "Scene.h"
#include "StrId.h"
#include "SteeringMath.h"

// string ids
extern StrId WANDER_DESTINATION;
extern StrId MOVEMENT;

/**
* Behavior for movement, updates transformations according
* to the Movement attribute
*/
class MovementComponent : public Component {
public:
	virtual void Init();

	virtual void OnMessage(Msg& msg) {

	}

	virtual void Update(uint64_t delta, uint64_t absolute);
};

class SimpleMoveComponent : public Component {
	virtual void Init();

	virtual void OnMessage(Msg& msg) {

	}

	virtual void Update(uint64_t delta, uint64_t absolute);
};

class WanderComponent : public Component {
private:
private:
	// radius of the wandering circle
	float wanderRadius = 0;
	// distance of the wandering circle
	float wanderDistance = 0;
	// randomness of the point on the circle
	float wanderJitter = 0;
	StrId forceId;
	SteeringMath steeringMath;
public:

	WanderComponent(float wanderRadius, float wanderDistance, float wanderJitter) 
		:wanderRadius(wanderRadius), wanderDistance(wanderDistance), wanderJitter(wanderJitter) {

	}

	float WanderComponent::ClampAngle(float x);

	void WanderComponent::SetRotationDirection(Movement& movement, Trans& transform, ofVec2f destination, float maxAcceleration, uint64 delta);

	virtual void Init();

	virtual void OnMessage(Msg& msg) {
		
	}

	virtual void Update(uint64_t delta, uint64_t absolute);
};


class ComponentExample2 : public ofBaseApp, Context {
public:
	int frameCounter = 0;
	float fps = 60;

	// all pressed keys
	set<int> pressedKeys;

	uint64_t delta;
	uint64_t absolute;

	float virtualAspectRatio = 2.0f;


	// root object
	Scene* scene;
	TransformBuilder transBld;

	// renderer component
	Renderer* renderer;

	void PushNodeIntoRenderer(GameObject* node);

	void setup();
	void update();
	void draw();

	void keyPressed(int key);
	void keyReleased(int key);
	void windowResized(int w, int h);

	// context methods
	virtual set<int>& GetPressedKeys() {
		return pressedKeys;
	}
};
