#pragma once

#include "AphMain.h"
#include "Renderable.h"
#include "GameObject.h"
#include "Renderer.h"
#include "TransformBuilder.h"
#include "Context.h"
#include "Scene.h"
#include "ArkanoidConstants.h"

/**
 * Base app that handles rendering engine and scales root element as it changes its size
 */
class AphApp : public ofBaseApp, public Context {
public:

	ofVec2f originalRootObjScale = ofVec2f(0);
	int frameCounter = 0;
	float fps = 60;
	float meshDefaultScale;
	float virtualAspectRatio;
	map<string, ofSoundPlayer*> playingSounds;
	// all pressed keys
	set<int> pressedKeys;

	uint64_t delta;
	uint64_t absolute;

	Scene* scene;
	// renderer component
	Renderer* renderer;
	map<string, ofImage*> images;
	bool resetGamePending = false;
	void PushNodeIntoRenderer(GameObject* node);

	virtual void Reset() {
		
	}

	virtual void Init() = 0;

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

	virtual void ResetGame() {
		resetGamePending = true;
	}

	virtual ofImage* GetImage(string path);

	virtual void PlaySound(string path);
	virtual int GetMappedKey(StrId action) = 0;

protected:
	void LoadSound(string path) {
		auto snd = new ofSoundPlayer();
		snd->load(path);
		playingSounds[path] = snd;
	}
};
