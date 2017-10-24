#pragma once

#include "AphMain.h"
#include "Renderable.h"
#include "GameObject.h"
#include "Renderer.h"
#include "TransformBuilder.h"
#include "Context.h"
#include "Scene.h"
#include "GameValues.h"
#include "ParatrooperModel.h"

class ParatrooperApp : public ofBaseApp, Context {
public:

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
	ParatrooperModel* model = nullptr;
	map<string, ofImage*> images;
	map<string, ofSoundPlayer*> playingSounds;

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
