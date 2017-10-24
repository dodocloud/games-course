#include "ParatrooperApp.h"
#include "AphUtils.h"
#include "SpriteSheetBuilder.h"
#include "GameManager.h"
#include "CannonController.h"
#include "CollisionManager.h"
#include "ScoreComponent.h"
#include "ParatrooperModel.h"
#include "DeathChecker.h"
#include "ParatrooperFactory.h"
#include "ofLog.h"
#include "GameValues.h"

//--------------------------------------------------------------
void ParatrooperApp::setup() {
	if (CheckAPHVersion()) {
		ofLogNotice("APP", "Game stared");
		ofSetFrameRate(fps);
		virtualAspectRatio = ((float)ofGetWindowSize().x) / ofGetWindowSize().y;

		// initialize renderer and scene
		renderer = new Renderer();
		renderer->OnInit();
		scene = new Scene();

		// init sounds
		auto fireSnd = new ofSoundPlayer();
		auto killSnd = new ofSoundPlayer();
		auto gameOverSnd = new ofSoundPlayer();
		fireSnd->load(FILE_SOUND_FIRE);
		killSnd->load(FILE_SOUND_KILL);
		gameOverSnd->load(FILE_SOUND_GAMEOVER);

		playingSounds[FILE_SOUND_FIRE] = fireSnd;
		playingSounds[FILE_SOUND_KILL] = killSnd;
		playingSounds[FILE_SOUND_GAMEOVER] = gameOverSnd;

		this->Reset();
	}
}

void ParatrooperApp::Reset() {
	ofLogNotice("APP", "Game reset");

	if(scene->GetRootObject() != nullptr) {
		delete scene->GetRootObject();
	}

	if(model == nullptr) {
		model = ParatrooperFactory::LoadGameModel();
	}else {
		// reset dynamic data
		model->Reset();
	}

	// set scale factor so that the whole scene will have size of 100x50 units
	float desiredSceneWidth = 100.0f;
	float autoScale = ofGetWindowSize().x / desiredSceneWidth;
	this->meshDefaultScale = 1.0f / autoScale * (ofGetWindowSize().x / 800.0f);
	
	// create root object
	auto rootObject = new GameObject(OBJECT_ROOT, this, scene, new FRect(ofGetWindowSize().x / autoScale, ofGetWindowSize().y / autoScale, ofColor(0)));
	scene->SetRootObject(rootObject);
	// initialize virtual size
	windowResized(ofGetWindowSize().x, ofGetWindowSize().y);

	// initialize the scene structure
	ParatrooperFactory::InitializeGame(rootObject, model);
}

void ParatrooperApp::PushNodeIntoRenderer(GameObject* node) {
	renderer->PushNode(node->GetMesh());

	for (auto child : node->GetChildren()) {
		PushNodeIntoRenderer(child);
	}
}

//--------------------------------------------------------------
void ParatrooperApp::update() {
	frameCounter++;

	delta = ofGetSystemTime() - absolute;
	absolute = ofGetSystemTime();

	float expectedDelta = 1000 / fps;
	// when performance goes down, the maximum delta value is fixed
	uint64 fixDelta = (delta < expectedDelta) ? expectedDelta : (delta < (2 * expectedDelta)) ? delta : (2 * expectedDelta);

	scene->GetRootObject()->Update(fixDelta, absolute);
	scene->GetRootObject()->UpdateTransformations();

	if(resetGamePending) {
		// game has to be reinitialized after the update process
		resetGamePending = false;
		this->Reset();
	}
}

//--------------------------------------------------------------
void ParatrooperApp::draw() {
	renderer->ClearBuffers();
	renderer->BeginRender();

	// add objects into renderer
	PushNodeIntoRenderer(scene->GetRootObject());

	renderer->Render();
	renderer->EndRender();
}

//--------------------------------------------------------------
void ParatrooperApp::keyPressed(int key) {
	pressedKeys.insert(key);
}

//--------------------------------------------------------------
void ParatrooperApp::keyReleased(int key) {
	pressedKeys.erase(key);
}

//--------------------------------------------------------------
void ParatrooperApp::windowResized(int w, int h) {
	ofLogNotice("APP", "Window resized to %dx%d", w, h);

	// change the scale of the root object in order to fit the screen

	if (originalRootObjScale == ofVec2f(0)) {
		originalRootObjScale = scene->GetRootObject()->GetTransform().scale;
	}

	float aspectRatio = ((float)w) / h;

	int rendererWidth = 0;
	int rendererHeight = 0;

	if (aspectRatio < virtualAspectRatio) {
		rendererWidth = w;
		rendererHeight = (int)(w / virtualAspectRatio);
	}
	else {
		rendererWidth = (int)(h*virtualAspectRatio);
		rendererHeight = h;
	}

	renderer->SetVirtualWidth(rendererWidth);
	renderer->SetVirtualHeight(rendererHeight);

	auto rootRect = scene->GetRootObject()->GetMesh<FRect>();
	float aspectDiff = ((float)rendererWidth) / rootRect->GetWidth();
	scene->GetRootObject()->GetTransform().scale = originalRootObjScale * ofVec3f(aspectDiff);
	scene->GetRootObject()->GetTransform().SetAbsAsLocal();
}

ofImage* ParatrooperApp::GetImage(string path) {
	// place all images into map
	auto found = images.find(path);

	if (found != images.end()) {
		return found->second;
	}
	else {
		auto newImg = new ofImage();
		newImg->load(path);
		images[path] = newImg;
		return newImg;
	}
}

void ParatrooperApp::PlaySound(string path) {
	playingSounds[path]->play();
}

int ParatrooperApp::GetMappedKey(StrId action) {
	if (action == ACTION_LEFT) return OF_KEY_LEFT;
	if (action == ACTION_RIGHT) return OF_KEY_RIGHT;
	if (action == ACTION_FIRE) return OF_KEY_ALT;
	return 0;
}