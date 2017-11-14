#pragma once

#include "ofVec2f.h"
#include "Movement.h"
#include "Transform.h"
#include "Path.h"

#define INT_MIN     (-2147483647 - 1) // minimum (signed) int value
#define INT_MAX       2147483647    // maximum (signed) int value

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
	* @param maxVelocity maximum velocity
	*/
	ofVec2f Seek(Trans& transform, Movement& movement, ofVec2f dest, float maxVelocity);

	/**
	* Calculates arrive behavior (accelerate and stop at target point)
	* @param transform current transformation of the object
	* @param movement current movement attribute of the object
	* @param dest destination point
	* @param maxVelocity maximum velocity
	* @param slowingRadius distance from target where the object should slow down
	* returns INT_MIN if the object has reached the target position
	*/
	ofVec2f Arrive(Trans& transform, Movement& movement, ofVec2f dest, float maxVelocity, float slowingRadius);


	/**
	* Calculates follow behavior (follow the given path)
	* @param transform current transformation of the object
	* @param movement current movement attribute of the object
	* @param path path to follow
	* @param currentPointIndex current index of segments that is followed
	* @param pointTolerance maximum tolerated distance between point on the path and the position of the object
	* @param finalPointTolerance maximum tolerated distance between final point and the position of the object
	* @param maxVelocity maximum velocity
	* @param slowingRadius distance from target where the object should slow down
	* returns INT_MIN if there is nowhere to go
	*/
	ofVec2f Follow(Trans& transform, Movement& movement, Path* path, int& currentPointIndex,
		float pointTolerance, float finalPointTolerance, float maxVelocity, float slowingRadius);

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