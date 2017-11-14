#include "SteeringComponent.h"
#include "GameObject.h"

StrId WANDER_DEST("WANDER_DEST");
StrId ATTR_MOVEMENT("ATTR_MOVEMENT");
StrId ATTR_STEERING_BEH_DEST("ATTR_STEERING_BEH_DEST");


void AIMovementComponent::Init() {
	if (!owner->HasAttr(ATTR_MOVEMENT)) {
		owner->AddAttr(ATTR_MOVEMENT, Movement());
	}
}

void AIMovementComponent::Update(const uint64_t delta, const uint64_t absolute) {

	Trans& transform = owner->GetTransform();
	Movement& movement = owner->GetAttr<Movement>(ATTR_MOVEMENT);
	auto& velocity = movement.GetVelocity();

	// update velocity according to all forces
	movement.SetVelocity(movement.GetVelocity() + movement.CalcForce());
	// update transformations (velocity is measured in units per second)
	transform.localPos.x += velocity.x*0.001f*delta;
	transform.localPos.y += velocity.y*0.001f*delta;
	transform.rotation += movement.GetAngularSpeed()*0.001f*delta;
	
	// check boundaries
	if ((transform.localPos.x < -3 && velocity.x < 0) || (transform.localPos.x > 93 && velocity.x > 0)) {
		velocity.x *= -1;
	}

	if ((transform.localPos.y < -3 && velocity.y < 0) || (transform.localPos.y > 93 && velocity.y > 0)) {
		velocity.y *= -1;
	}
}

float SteeringComponent::ClampAngle(float x) {
	x = fmod(x + 180, 360);
	if (x < 0)
		x += 360;
	return x - 180;
}

void SteeringComponent::SetRotationDirection(Movement& movement, Trans& transform, ofVec2f destination, float maxAcceleration, uint64 delta) {
	float actualRotation = transform.rotation;
	float neededRotation = transform.CalcAngle(destination);

	actualRotation = ClampAngle(actualRotation);
	neededRotation = ClampAngle(neededRotation);

	auto diff = DEG_TO_RAD*(actualRotation - neededRotation);
	// calculate difference between actual and desired rotation
	float rotDiff = -RAD_TO_DEG*atan2(sin(diff), cos(diff));

	if (isnan(rotDiff)) rotDiff = 0;

	// rotate to the desired rotation
	movement.SetAngularSpeed(rotDiff*maxAcceleration);
}

void AIWanderComponent::Init() {
	owner->AddAttr(WANDER_DEST, ofVec2f(0));
	owner->AddAttr(ATTR_MOVEMENT, Movement());
}


void AIWanderComponent::Update(uint64_t delta, uint64_t absolute) {
	auto& transform = owner->GetTransform();
	Movement& movement = owner->GetAttr<Movement>(ATTR_MOVEMENT);
	ofVec2f behWander = owner->GetAttr<ofVec2f>(WANDER_DEST);
	

	ofVec2f force = steeringMath.Wander(transform, movement, behWander, wanderRadius, wanderDistance, wanderJitter, delta);
	owner->ChangeAttr(WANDER_DEST, behWander);

	// add velocity dependency
	movement.SetForce(forceId, force);
	this->SetRotationDirection(movement, transform, transform.localPos + movement.GetVelocity(), 20, delta);
}

void FollowBehavior::Init() {
	if (!owner->HasAttr(attrMovement)) {
		owner->AddAttr(attrMovement, Movement());
	}
}

void FollowBehavior::Update(const uint64_t delta, const uint64_t absolute) {
	auto& transform = owner->GetTransform();
	Movement& movement = owner->GetAttr<Movement>(attrMovement);

	ofVec2f force = steeringMath.Follow(transform, movement, path, currentPathIndex,
		pointTolerance, finalPointTolerance, maxAcceleration, 20);

	if (force == ofVec2f(INT_MAX)) {
		// finish
		movement.Stop();
		pathFinished = true;
		return;
	}

	movement.SetForce(forceId, force * forceStrength);

	this->SetRotationDirection(movement, transform, transform.localPos + movement.GetVelocity(), maxRadialAcceleration, delta);
}