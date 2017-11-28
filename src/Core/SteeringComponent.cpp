#include "SteeringComponent.h"
#include "GameObject.h"

extern char WANDER_DEST[] = "WANDER_DEST";
extern char ATTR_DYNAMICS[] = "ATTR_DYNAMICS";
extern char ATTR_STEERING_BEH_DEST[] = "ATTR_STEERING_BEH_DEST";


void DynamicsComponent::Init() {
	if (!owner->HasAttr(ATTR_DYNAMICS)) {
		owner->AddAttr(ATTR_DYNAMICS, new Dynamics());
	}
}

void DynamicsComponent::Update(const uint64_t delta, const uint64_t absolute) {

	Trans& transform = owner->GetTransform();
	Dynamics* dynamics = owner->GetAttr<Dynamics*>(ATTR_DYNAMICS);
	auto& velocity = dynamics->GetVelocity();

	// update velocity according to all forces
	dynamics->SetVelocity(dynamics->GetVelocity() + dynamics->CalcForce());
	// update transformations (velocity is measured in units per second)
	transform.localPos.x += velocity.x*0.001f*delta;
	transform.localPos.y += velocity.y*0.001f*delta;
	transform.rotation += dynamics->GetAngularSpeed()*0.001f*delta;
	
	// check boundaries
	if ((transform.localPos.x < -3 && velocity.x < 0) || (transform.localPos.x > 93 && velocity.x > 0)) {
		velocity.x *= -1;
	}

	if ((transform.localPos.y < -3 && velocity.y < 0) || (transform.localPos.y > 93 && velocity.y > 0)) {
		velocity.y *= -1;
	}
}

void SimpleMoveComponent::Init() {
	if (!owner->HasAttr(ATTR_DYNAMICS)) {
		owner->AddAttr(ATTR_DYNAMICS, new Dynamics());
	}
}

void SimpleMoveComponent::Update(uint64_t delta, uint64_t absolute) {
	auto dynamics = owner->GetAttr<Dynamics*>(ATTR_DYNAMICS);

	if (dynamics->GetVelocity() == ofVec2f()) {
		// initialize velocity
		dynamics->SetVelocity(ofVec2f(ofRandom(-50, 50), ofRandom(-50, 50)));
	}

	if (ofRandom(0, 1) < 0.002f) {
		// change velocity
		dynamics->SetVelocity(ofVec2f(ofRandom(-50, 50), ofRandom(-50, 50)));
	}
}

float SteeringComponent::ClampAngle(float x) {
	x = fmod(x + 180, 360);
	if (x < 0)
		x += 360;
	return x - 180;
}

void SteeringComponent::SetRotationDirection(Dynamics* dynamics, Trans& transform, ofVec2f destination, float maxAcceleration, uint64 delta) {
	float actualRotation = transform.rotation;
	float neededRotation = transform.CalcAngle(destination);

	actualRotation = ClampAngle(actualRotation);
	neededRotation = ClampAngle(neededRotation);

	auto diff = DEG_TO_RAD*(actualRotation - neededRotation);
	// calculate difference between actual and desired rotation
	float rotDiff = -RAD_TO_DEG*atan2(sin(diff), cos(diff));

	if (isnan(rotDiff)) rotDiff = 0;

	// rotate to the desired rotation
	dynamics->SetAngularSpeed(rotDiff*maxAcceleration);
}

void WanderComponent::Init() {
	owner->AddAttr(WANDER_DEST, ofVec2f(0));
	owner->AddAttr(ATTR_DYNAMICS, new Dynamics());
}


void WanderComponent::Update(uint64_t delta, uint64_t absolute) {
	auto& transform = owner->GetTransform();
	Dynamics* dynamics = owner->GetAttr<Dynamics*>(ATTR_DYNAMICS);
	ofVec2f behWander = owner->GetAttr<ofVec2f>(WANDER_DEST);
	

	ofVec2f force = steeringMath.Wander(transform, dynamics, behWander, wanderRadius, wanderDistance, wanderJitter, delta);
	owner->ChangeAttr(WANDER_DEST, behWander);

	// add velocity dependency
	dynamics->SetForce(forceId, force);
	this->SetRotationDirection(dynamics, transform, transform.localPos + dynamics->GetVelocity(), 20, delta);
}

void FollowBehavior::Init() {
	if (!owner->HasAttr(attrMovement)) {
		owner->AddAttr(attrMovement, new Dynamics());
	}
}

void FollowBehavior::Update(const uint64_t delta, const uint64_t absolute) {
	if (!PathFinished()) {
		auto& transform = owner->GetTransform();
		Dynamics* dynamics = owner->GetAttr<Dynamics*>(attrMovement);

		ofVec2f force = steeringMath.Follow(transform, dynamics, path, currentPathIndex,
			pointTolerance, finalPointTolerance, maxAcceleration, 20);

		if (force == ofVec2f(INT_MAX)) {
			// finish
			dynamics->Stop();
			pathFinished = true;
			return;
		}

		dynamics->SetForce(forceId, force * forceStrength);

		this->SetRotationDirection(dynamics, transform, transform.localPos + dynamics->GetVelocity(), maxRadialAcceleration, delta);
	}
}
