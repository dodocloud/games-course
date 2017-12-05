#pragma once

#include "ofVec2f.h"
#include "ofVec3f.h"
#include "ofMatrix4x4.h"


/**
* Entity that holds local and absolute transformation vectors
* For now, only 2D transformations are supported; the Z axis is used for z-index
*/
class Trans {

public:

	Trans() {

	}

	/**
	* Creates a new transformation entity
	* @param posX position in X axis
	* @param posY position in Y axis
	*/
	Trans(float posX, float posY);

	/**
	* Creates a new transformation entity
	* @param posX position in X axis
	* @param posY position in Y axis
	* @param posZ position in Z axis
	*/
	Trans(float posX, float posY, float posZ);

	Trans(ofVec3f pos);

	// local position
	ofVec3f localPos = ofVec3f(0);
	// local scale
	ofVec3f scale = ofVec3f(1);
	// local rotation in radians
	float rotation = 0;
	// local rotation centroid
	ofVec3f rotationCentroid = ofVec3f(0);

	// absolute position - recalculated due to parent's transform
	ofVec3f absPos = ofVec3f(0);
	// absolute scale    - recalculated due to parent's transform
	ofVec3f absScale = ofVec3f(1);
	// absolute rotation - recalculated due to parent's transform
	float absRotation = 0;
	// absolute rotation centroid
	ofVec3f absRotationCentroid = ofVec3f(0);

	ofVec3f& GetLocalPos() { return localPos; }
	ofVec3f& GetScale() { return scale; }


	/**
	* Sets absolute coordinates to be the same as local
	* Mostly used for root objects that haven't any parent
	*/
	void SetAbsAsLocal();

	/**
	* Calculates absolute coordinates according to the parent's transformation
	*/
	void CalcAbsTransform(Trans& parent);

	/**
	* Calculates angle in degrees between local position and given position
	*/
	float CalcAngle(ofVec2f pos);

	/**
	* Sets rotation as a angle between local position and given position so that
	* the object will be oriented in the direction of the position vector
	*/
	void SetRotationAsAngleToPosition(ofVec2f pos);

	/**
	* Calculates absolute transformation matrix
	*/
	ofMatrix4x4 CalcAbsMatrix();

	/**
	* Calculates local transformation matrix
	*/
	ofMatrix4x4 CalcMatrix();
};

namespace std {
	// overriding hash function for transform
	template <>
	struct hash<Trans> {
		inline size_t operator()(const Trans& pos) const {
			return ((int)pos.absPos.x) * 1812433253 + ((int)pos.absPos.y);
		}
	};
}

