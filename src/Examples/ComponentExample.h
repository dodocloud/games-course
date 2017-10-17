#pragma once

#include "AphMain.h"
#include "Renderable.h"
#include "GameObject.h"
#include "Renderer.h"
#include "TransformBuilder.h"
#include "Context.h"
#include "Scene.h"
#include "StrId.h"

// string ids
extern StrId ANGULAR_VELOCITY;
extern StrId ACTION_ROTATION_FINISHED;



class SquareComponent : public Component {
private:
	bool isAnimating = false;
public:

	SquareComponent(bool isAnimating) : isAnimating(isAnimating) {

	}

	virtual void Init();

	virtual void OnMessage(Msg& msg);

	virtual void Update(uint64_t delta, uint64_t absolute);
};


class ComponentExample : public ofBaseApp, Context {
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
