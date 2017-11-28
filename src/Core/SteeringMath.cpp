#include "SteeringMath.h"

ofVec2f SteeringMath::Seek(Trans& transform, Dynamics* dynamics, ofVec2f dest, float maxVelocity) {
	ofVec2f desiredVelocity = (dest - transform.localPos).normalized() * maxVelocity;
	return desiredVelocity - dynamics->GetVelocity();
}

ofVec2f SteeringMath::Arrive(Trans& transform, Dynamics* dynamics, ofVec2f dest, float maxVelocity, float slowingRadius) {
	
	auto desiredVelocity = dest - ofVec2f(transform.localPos.x, transform.localPos.y);
	auto distance = desiredVelocity.length();

	if (distance < slowingRadius) {
		desiredVelocity = desiredVelocity.normalized() * maxVelocity * (distance / slowingRadius);
	}
	else {
		desiredVelocity = desiredVelocity.normalized() * maxVelocity;
	}

	auto force = desiredVelocity - dynamics->GetVelocity();
	return force;
}


ofVec2f SteeringMath::Follow(Trans& transform, Dynamics* dynamics, Path* path, int& currentPointIndex,
	float pointTolerance, float finalPointTolerance, float maxVelocity, float slowingRadius) {

	int targetPointIndex;
	ofVec2f targetPointLocation;
	ofVec2f currentPointLocation = transform.localPos;

	float radiusTolerance = currentPointIndex == (path->GetSegments().size() - 1) ? finalPointTolerance : pointTolerance;

	path->CalcTargetPoint(currentPointIndex, radiusTolerance, currentPointLocation, targetPointIndex, targetPointLocation);
	
	if (targetPointLocation == currentPointLocation) {
		return ofVec2f(INT_MAX); // nowhere to go to
	}

	// update index of the current point
	currentPointIndex = targetPointIndex;

	if(currentPointIndex == (path->GetSegments().size() - 1)) {
		// final point -> use arrive
		return Arrive(transform, dynamics, targetPointLocation, maxVelocity, slowingRadius);
	}else {
		return Seek(transform, dynamics, targetPointLocation, maxVelocity);
	}
}

ofVec2f SteeringMath::Wander(Trans& transform, Dynamics* dynamics, ofVec2f& wanderTarget, float wanderRadius, float wanderDistance,
	float wanderJitter, uint64_t deltaTime) {

	ofVec2f randomVec = ofVec2f(ofRandomf(), ofRandomf());
	wanderTarget += randomVec*(deltaTime*wanderJitter);
	wanderTarget.normalize();
	wanderTarget *= wanderRadius;

	ofVec2f direction = dynamics->GetVelocity().normalize();
	ofVec2f shift = wanderTarget + (direction*wanderDistance);
	return shift;
}