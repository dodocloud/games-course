#pragma once

#include "AphMain.h"
#include "Renderable.h"
#include "GameObject.h"
#include "Renderer.h"
#include "TransformBuilder.h"
#include "Context.h"
#include "Scene.h"
#include "AIConstants.h"

class AIAgentsApp : public ofBaseApp, Context {
public:

	/**
	 * 0: passable path
	 * 1: wall
	 * 2: warehouse
	 * 3: iron ore
	 * 4: petrol
	 */
	int aiMap[AIMAP_WIDTH][AIMAP_HEIGHT] = {
		{ 0, 0, 0, 0, 0, 0, 0, 0, 0, 3 },
		{ 0, 3, 0, 0, 0, 0, 0, 0, 1, 1 },
		{ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
		{ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
		{ 0, 0, 0, 0, 2, 0, 0, 0, 0, 0 },
		{ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
		{ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
		{ 0, 0, 0, 0, 0, 0, 1, 1, 1, 0 },
		{ 1, 1, 0, 0, 0, 0, 1, 4, 1, 0 },
		{ 3, 0, 0, 0, 0, 0, 0, 0, 1, 0 }
	};


	ofVec2f originalRootObjScale = ofVec2f(0);
	int frameCounter = 0;
	float fps = 60;
	float meshDefaultScale;
	bool resetGamePending = false;
	float virtualAspectRatio;

	// all pressed keys
	set<int> pressedKeys;

	uint64_t delta;
	uint64_t absolute;

	Scene* scene;
	// renderer component
	Renderer* renderer;
	map<string, ofImage*> images;

	void PushNodeIntoRenderer(GameObject* node);

	void Reset();

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

	virtual int GetVirtualWidth() {
		return renderer->GetVirtualWidth();
	}

	virtual int GetVirtualHeight() {
		return renderer->GetVirtualHeight();
	}

	virtual float GetMeshDefaultScale() {
		return meshDefaultScale;
	}

	virtual float GetGameSpeed() {
		return 0.1f;
	}

	virtual ofImage* GetImage(string path);

	virtual void ResetGame() {
		resetGamePending = true;
	}

	virtual void PlaySound(string path);
	virtual int GetMappedKey(StrId action);
};
