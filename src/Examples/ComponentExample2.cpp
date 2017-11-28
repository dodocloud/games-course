#include "ComponentExample2.h"
#include "AphUtils.h"
#include "SpriteSheetBuilder.h"
#include "SteeringComponent.h"

//--------------------------------------------------------------
void ComponentExample2::setup() {
	if (CheckAPHVersion()) {

		ofSetFrameRate(fps);

		// initialize renderer
		renderer = new Renderer();
		renderer->OnInit();

		scene = new Scene();

		auto rootObject = new GameObject(this, scene, new FRect(ofGetWindowSize().x, ofGetWindowSize().y));
		rootObject->GetMesh<FRect>()->SetColor(ofColor(0, 0, 0));
		scene->SetRootObject(rootObject);

		virtualAspectRatio = ((float)ofGetWindowSize().x) / ofGetWindowSize().y;
		// initialize virtual size
		windowResized(ofGetWindowSize().x, ofGetWindowSize().y);

		rootObject->UpdateTransformations();

		for (int i = 0; i < 100; i++) {
			auto mesh = new FRect(1, 1);
			auto obj = new GameObject(this, scene, mesh);
			
			if(ofRandom(0,1) > 0.5f) {
				obj->AddComponent(new WanderComponent(300 * (ofRandomf() + 1), 5000 * (ofRandomf() + 1), 1000000));
				mesh->SetColor(ofColor(255, 0, 0));
			}else {
				obj->AddComponent(new SimpleMoveComponent());
				mesh->SetColor(ofColor(0, 255, 0));
			}

			obj->AddComponent(new DynamicsComponent());
			rootObject->AddChild(obj);

			// set positions
			transBld.RelativePosition(0.5f, 0.5f).Anchor(0.5f, 0.5f).RelativeScale(0.01f, 0).ZIndex(2).BuildAndReset(obj);
		}
	}
}

void ComponentExample2::PushNodeIntoRenderer(GameObject* node) {
	renderer->PushNode(node->GetRenderable());

	for (auto child : node->GetChildren()) {
		PushNodeIntoRenderer(child);
	}
}

//--------------------------------------------------------------
void ComponentExample2::update() {
	frameCounter++;

	delta = ofGetSystemTime() - absolute;
	absolute = ofGetSystemTime();

	float expectedDelta = 1000 / fps;
	// when performance goes down, the maximum delta value is fixed
	uint64 fixDelta = (delta < expectedDelta) ? expectedDelta : (delta < (2 * expectedDelta)) ? delta : (2 * expectedDelta);

	scene->GetRootObject()->Update(fixDelta, absolute);
	scene->GetRootObject()->UpdateTransformations();
}

//--------------------------------------------------------------
void ComponentExample2::draw() {
	renderer->ClearBuffers();
	renderer->BeginRender();

	// add objects into renderer
	PushNodeIntoRenderer(scene->GetRootObject());

	renderer->Render();
	renderer->EndRender();
}

//--------------------------------------------------------------
void ComponentExample2::keyPressed(int key) {
	pressedKeys.insert(key);
}

//--------------------------------------------------------------
void ComponentExample2::keyReleased(int key) {
	pressedKeys.erase(key);
}

//--------------------------------------------------------------
void ComponentExample2::windowResized(int w, int h) {

	// we need to have map image loaded in order to scale root transform to fit the whole screen
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

	// scale the root object so that the scene fits the screen
	float aspectDiff = ((float)rendererWidth) / rootRect->GetWidth();
	scene->GetRootObject()->GetTransform().scale = ofVec3f(aspectDiff);
	scene->GetRootObject()->GetTransform().SetAbsAsLocal();
}
