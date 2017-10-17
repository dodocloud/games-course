#pragma once

#include "ofVec2f.h"
#include "Movement.h"
#include "Transform.h"

/**
* Container for Steering Behaviors calculations
* Supported behaviors are Seek, Arrive, Flee, Follow and Wander
* For more informations, see http://gamedevelopment.tutsplus.com/series/understanding-steering-behaviors--gamedev-12732
*/
class SteeringMath {
public:
	/**
	* Calculates seek behavior (accelerate to target point)
	* @param transform current transformation of the object
	* @param movement current movement attribute of the object
	* @param dest destination point
	* @param maxAcceleration maximum acceleration
	*/
	ofVec2f Seek(Trans& transform, Movement& movement, ofVec2f dest, float maxAcceleration);

	/**
	* Calculates arrive behavior (accelerate and stop at target point)
	* @param transform current transformation of the object
	* @param movement current movement attribute of the object
	* @param dest destination point
	* @param decelartionSpeed deceleration speed
	* @param stopDistance distance from target where the object should slow down
	* returns INT_MIN if the object has reached the target position
	*/
	ofVec2f Arrive(Trans& transform, Movement& movement, ofVec2f dest, float decelerationSpeed, float stopDistance);

	/**
	* Calculates flee behavior (accelerate away from target point)
	* @param transform current transformation of the object
	* @param movement current movement attribute of the object
	* @param dest destination point
	* @param fleeDistance the distance from the destination point the object should stop
	* @param maxAcceleration maximum acceleration
	*/
	ofVec2f Flee(Trans& transform, Movement& movement, ofVec2f dest, float fleeDistance, float maxAcceleration);

	/**
	* Calculates wander behavior (realistic casual movement which will make the player think
	* that the character is really alive and walking around)
	* @param transform current transformation of the object
	* @param movement current movement attribute of the object
	* @param wanderTarget input/output value, indicates normalized direction of the object's velocity
	* @param wanderRadius radius of the wander circle
	* @param wanderDistance distance between object and the wander circle
	* @param wanderJitter jittering coefficient (higher value means higher randomness)
	* @param deltaTime delta time since the last calculation
	*/
	ofVec2f Wander(Trans& transform, Movement& movement, ofVec2f& wanderTarget, float wanderRadius, float wanderDistance,
		float wanderJitter, uint64_t deltaTime);
};