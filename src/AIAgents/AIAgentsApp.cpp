
#include "AIAgentsApp.h"
#include "AphUtils.h"
#include "AIAgentsFactory.h"
#include "ofLog.h"
#include "AIConstants.h"
#include "ScriptManager.h"

//--------------------------------------------------------------
void AIAgentsApp::setup() {
	if (CheckAPHVersion()) {
		ofSetFrameRate(fps);
		virtualAspectRatio = ((float)ofGetWindowSize().x) / ofGetWindowSize().y;

		// initialize renderer and scene
		renderer = new Renderer();
		renderer->OnInit();

		// load sprite sheets
		auto spritesImage = this->GetImage(FILE_SPRITES);
		renderer->AddTileLayer(spritesImage, "spriteLayer", 1000, 1);

		scene = new Scene();
		this->Reset();
	}
}

void AIAgentsApp::Reset() {
	if(scene->GetRootObject() != nullptr) {
		delete scene->GetRootObject();
	}
	
	// set scale factor so that the whole scene will have the height of 100 units
	float desiredSceneHeight = 100.0f;
	float autoScale = ofGetWindowSize().y / desiredSceneHeight;
	this->meshDefaultScale = 1.0f / autoScale * (ofGetWindowSize().y / 800.0f);
	
	// create root object
	auto boundingRectangle = new FRect(ofGetWindowSize().x / autoScale, ofGetWindowSize().y / autoScale, ofColor(0));
	boundingRectangle->SetIsRenderable(false);
	auto rootObject = new GameObject(OBJECT_AI_ROOT, this, scene, boundingRectangle);
	scene->SetRootObject(rootObject);

	// initialize virtual size
	windowResized(ofGetWindowSize().x, ofGetWindowSize().y);

	auto scripts = ScriptManager::GetInstance();
	scripts->Init();
	AIAgentsFactory::InitLuaMapping(ScriptManager::GetInstance()->GetLua());
	

	auto gameModel = AIAgentsFactory::LoadGameModel(aiMap);
	// init game
	AIAgentsFactory::InitializeGame(rootObject, gameModel);
}

void AIAgentsApp::PushNodeIntoRenderer(GameObject* node) {
	renderer->PushNode(node->GetRenderable());

	for (auto child : node->GetChildren()) {
		PushNodeIntoRenderer(child);
	}
}

//--------------------------------------------------------------
void AIAgentsApp::update() {
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
void AIAgentsApp::draw() {
	renderer->ClearBuffers();
	renderer->BeginRender();

	// add objects into renderer
	PushNodeIntoRenderer(scene->GetRootObject());

	renderer->Render();
	renderer->EndRender();
}

//--------------------------------------------------------------
void AIAgentsApp::keyPressed(int key) {
	pressedKeys.insert(key);
}

//--------------------------------------------------------------
void AIAgentsApp::keyReleased(int key) {
	pressedKeys.erase(key);
}

//--------------------------------------------------------------
void AIAgentsApp::windowResized(int w, int h) {

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

ofImage* AIAgentsApp::GetImage(string path) {
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

void AIAgentsApp::PlaySound(string path) {
	// no sounds here
}

int AIAgentsApp::GetMappedKey(StrId action) {
	// no actions here
	return 0;
}
