#include "ComponentExample2.h"
#include "AphUtils.h"
#include "SpriteSheetBuilder.h"
#include "Movement.h"

StrId WANDER_DESTINATION("WANDER_DESTINATION");
StrId WMOVEMENT("WMOVEMENT");

void SimpleMoveComponent::Init() {
	if (!owner->HasAttr(WMOVEMENT)) {
		owner->AddAttr(WMOVEMENT, Movement());
	}
}

void SimpleMoveComponent::Update(uint64_t delta, uint64_t absolute) {
	Movement& movement = owner->GetAttr<Movement>(WMOVEMENT);

	if(movement.GetVelocity() == ofVec2f()) {
		// initialize velocity
		movement.SetVelocity(ofVec2f(ofRandom(-50,50), ofRandom(-50, 50)));
	}

	if(ofRandom(0,1) < 0.002f) {
		// change velocity
		movement.SetVelocity(ofVec2f(ofRandom(-50, 50), ofRandom(-50, 50)));
	}
}

void MovementComponent::Init() {
	if (!owner->HasAttr(WMOVEMENT)) {
		owner->AddAttr(WMOVEMENT, Movement());
	}
}

void MovementComponent::Update(const uint64_t delta, const uint64_t absolute) {

	Trans& transform = owner->GetTransform();
	Movement& movement = owner->GetAttr<Movement>(WMOVEMENT);
	auto& velocity = movement.GetVelocity();

	// update velocity according to all forces
	movement.SetVelocity(movement.GetVelocity() + movement.CalcForce()*0.001f*delta);
	// update transformations (velocity is measured in units per second)
	transform.localPos.x += velocity.x*0.001f*delta;
	transform.localPos.y += velocity.y*0.001f*delta;
	transform.rotation += movement.GetAngularSpeed()*0.001f*delta;

	// check boundaries
	if((transform.absPos.x < -50 && velocity.x < 0) || (transform.absPos.x > ofGetWindowSize().x && velocity.x > 0)) {
		velocity.x *= -1;
	}
	if ((transform.absPos.y < -50 && velocity.y < 0) || (transform.absPos.y > ofGetWindowSize().y && velocity.y > 0)) {
		velocity.y *= -1;
	}
}

void WanderComponent::Init() {
	owner->AddAttr(WANDER_DESTINATION, ofVec2f(0));
	owner->AddAttr(WMOVEMENT, Movement());
}

void WanderComponent::Update(uint64_t delta, uint64_t absolute) {
	auto& transform = owner->GetTransform();
	Movement& movement = owner->GetAttr<Movement>(WMOVEMENT);
	auto& velocity = movement.GetVelocity();

	ofVec2f behWander = owner->GetAttr<ofVec2f>(WANDER_DESTINATION);
	ofVec2f force = steeringMath.Wander(transform, movement, behWander, wanderRadius, wanderDistance, wanderJitter, delta);
	owner->ChangeAttr(WANDER_DESTINATION, behWander);

	// add velocity dependency
	movement.SetForce(forceId, force - movement.GetVelocity() / 2);
	this->SetRotationDirection(movement, transform, transform.localPos + movement.GetVelocity(), 0.004f, delta);
}

float WanderComponent::ClampAngle(float x) {
	x = fmod(x + 180, 360);
	if (x < 0)
		x += 360;
	return x - 180;
}

void WanderComponent::SetRotationDirection(Movement& movement, Trans& transform, ofVec2f destination, float maxAcceleration, uint64 delta) {
	float actualRotation = transform.rotation;
	float neededRotation = transform.CalcAngle(destination);

	actualRotation = DEG_TO_RAD*ClampAngle(actualRotation);
	neededRotation = DEG_TO_RAD*ClampAngle(neededRotation);

	// calculate difference between actual and desired rotation
	float rotDiff = -RAD_TO_DEG*atan2(sin(actualRotation - neededRotation), cos(actualRotation - neededRotation));

	if (isnan(rotDiff)) rotDiff = 0;

	// rotate to the desired rotation
	movement.SetAngularSpeed(rotDiff*maxAcceleration);
}

//--------------------------------------------------------------
void ComponentExample2::setup() {
	if (CheckAPHVersion()) {

		ofSetFrameRate(fps);

		// initialize renderer
		renderer = new Renderer();
		renderer->OnInit();

		scene = new Scene();

		auto rootObject = new GameObject(this, scene, new Rect(ofGetWindowSize().x, ofGetWindowSize().y));
		rootObject->GetMesh<Rect>()->SetColor(ofColor(0, 0, 0));
		scene->SetRootObject(rootObject);

		virtualAspectRatio = ((float)ofGetWindowSize().x) / ofGetWindowSize().y;
		// initialize virtual size
		windowResized(ofGetWindowSize().x, ofGetWindowSize().y);

		rootObject->UpdateTransformations();

		for (int i = 0; i < 100; i++) {
			auto mesh = new Rect(1, 1);
			auto obj = new GameObject(this, scene, mesh);
			
			if(ofRandom(0,1) > 0.5f) {
				obj->AddComponent(new WanderComponent(300 * (ofRandomf() + 1), 5000 * (ofRandomf() + 1), 1000000));
				mesh->SetColor(ofColor(255, 0, 0));
			}else {
				obj->AddComponent(new SimpleMoveComponent());
				mesh->SetColor(ofColor(0, 255, 0));
			}

			obj->AddComponent(new MovementComponent());
			rootObject->AddChild(obj);

			// set positions
			transBld.RelativePosition(0.5f, 0.5f).Anchor(0.5f, 0.5f).RelativeScale(0.01f, 0).ZIndex(2).BuildAndReset(obj);
		}
	}
}

void ComponentExample2::PushNodeIntoRenderer(GameObject* node) {
	renderer->PushNode(node->GetMesh());

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

	auto rootRect = scene->GetRootObject()->GetMesh<Rect>();

	// scale the root object so that the scene fits the screen
	float aspectDiff = ((float)rendererWidth) / rootRect->GetWidth();
	scene->GetRootObject()->GetTransform().scale = ofVec3f(aspectDiff);
	scene->GetRootObject()->GetTransform().SetAbsAsLocal();
}
