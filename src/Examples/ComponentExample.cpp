#include "ComponentExample.h"
#include "AphUtils.h"
#include "SpriteSheetBuilder.h"

StrId ANGULAR_VELOCITY("VELOCITY");
StrId ACTION_ROTATION_FINISHED("ACTION_ROTATION_FINISHED");


void SquareComponent::Init() {
	RegisterSubscriber(ACTION_ROTATION_FINISHED);
}

void SquareComponent::OnMessage(Msg& msg) {
	if(msg.GetAction() == ACTION_ROTATION_FINISHED) {
		isAnimating = !isAnimating;
	}
}

void SquareComponent::Update(uint64_t delta, uint64_t absolute) {
	if (isAnimating) {
		auto& trans = owner->GetTransform();

		float angularVelocity = owner->GetAttr<float>(ANGULAR_VELOCITY);
		trans.rotation += angularVelocity * delta;

		if(trans.rotation >= PI*2) {
			trans.rotation = 0;
			isAnimating = false;
			SendMsg(ACTION_ROTATION_FINISHED);
		}
	}
}

//--------------------------------------------------------------
void ComponentExample::setup() {
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

		auto redSquareMesh = new FRect(1, 1);
		redSquareMesh->SetColor(ofColor(255, 0, 0));

		auto blueSquareMesh = new FRect(1, 1);
		blueSquareMesh->SetColor(ofColor(0, 0, 255));

		auto redSquare = new GameObject(this, scene, redSquareMesh);
		auto blueSquare = new GameObject(this, scene, blueSquareMesh);
		redSquare->AddComponent(new SquareComponent(true));
		blueSquare->AddComponent(new SquareComponent(false));

		redSquare->AddAttr(ANGULAR_VELOCITY, 0.001f);
		blueSquare->AddAttr(ANGULAR_VELOCITY, 0.002f);

		// create scene hierarchy
		rootObject->AddChild(redSquare);
		rootObject->AddChild(blueSquare);

		rootObject->UpdateTransformations();

		// set positions
		transBld.RelativePosition(0.25f, 0.5f).Anchor(0.5f, 0.5f).RelativeScale(0.25f, 0).ZIndex(2).BuildAndReset(redSquare);
		transBld.RelativePosition(0.75f, 0.5f).Anchor(0.5f, 0.5f).RelativeScale(0.25f, 0).ZIndex(2).BuildAndReset(blueSquare);
	}
}

void ComponentExample::PushNodeIntoRenderer(GameObject* node) {
	renderer->PushNode(node->GetMesh());

	for (auto child : node->GetChildren()) {
		PushNodeIntoRenderer(child);
	}
}

//--------------------------------------------------------------
void ComponentExample::update() {
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
void ComponentExample::draw() {
	renderer->ClearBuffers();
	renderer->BeginRender();

	// add objects into renderer
	PushNodeIntoRenderer(scene->GetRootObject());

	renderer->Render();
	renderer->EndRender();
}

//--------------------------------------------------------------
void ComponentExample::keyPressed(int key) {
	pressedKeys.insert(key);
}

//--------------------------------------------------------------
void ComponentExample::keyReleased(int key) {
	pressedKeys.erase(key);
}

//--------------------------------------------------------------
void ComponentExample::windowResized(int w, int h) {

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
