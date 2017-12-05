#include "AphApp.h"
#include "AphUtils.h"
#include "ofLog.h"
//--------------------------------------------------------------
void AphApp::setup() {
	if (CheckAPHVersion()) {
		ofSetFrameRate(fps);
		virtualAspectRatio = ((float)ofGetWindowSize().x) / ofGetWindowSize().y;

		// initialize renderer and scene
		renderer = new Renderer();
		renderer->OnInit();
		this->Init();
		
		scene = new Scene();
		this->Reset();
		// initialize virtual size
		windowResized(ofGetWindowSize().x, ofGetWindowSize().y);
	}
}


void AphApp::PushNodeIntoRenderer(GameObject* node) {
	renderer->PushNode(node->GetRenderable());

	for (auto child : node->GetChildren()) {
		PushNodeIntoRenderer(child);
	}
}

//--------------------------------------------------------------
void AphApp::update() {
	frameCounter++;

	delta = ofGetSystemTime() - absolute;
	absolute = ofGetSystemTime();

	float expectedDelta = 1000 / fps;
	// when performance goes down, the maximum delta value is fixed
	uint64 fixDelta = (delta < expectedDelta) ? expectedDelta : (delta < (2 * expectedDelta)) ? delta : (2 * expectedDelta);

	scene->GetRootObject()->Update(fixDelta, absolute);
	scene->GetRootObject()->UpdateTransformations();

	if (resetGamePending) {
		// game has to be reinitialized after the update process
		resetGamePending = false;
		this->Reset();
	}
}

//--------------------------------------------------------------
void AphApp::draw() {
	renderer->ClearBuffers();
	renderer->BeginRender();

	// add objects into renderer
	PushNodeIntoRenderer(scene->GetRootObject());

	renderer->Render();
	renderer->EndRender();
}

//--------------------------------------------------------------
void AphApp::keyPressed(int key) {
	pressedKeys.insert(key);
}

//--------------------------------------------------------------
void AphApp::keyReleased(int key) {
	pressedKeys.erase(key);
}

//--------------------------------------------------------------
void AphApp::windowResized(int w, int h) {

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

ofImage* AphApp::GetImage(string path) {
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


void AphApp::PlaySound(string path) {
	playingSounds[path]->play();
}