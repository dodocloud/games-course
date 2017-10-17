#include "Transform.h"
#include "ofMath.h"

Trans::Trans(float posX, float posY) : localPos(ofVec3f(posX, posY)) {
	SetAbsAsLocal();
}

Trans::Trans(float posX, float posY, float posZ) : localPos(ofVec3f(posX, posY, posZ)) {
	SetAbsAsLocal();
}

Trans::Trans(ofVec3f pos) : localPos(pos) {
	SetAbsAsLocal();
}

void Trans::SetAbsAsLocal() {
	absPos = localPos;
	absScale = scale;
	absRotation = rotation;
}

void Trans::CalcAbsTransform(Trans& parent) {
	absScale = parent.absScale*scale;
	absRotation = rotation + parent.absRotation;
	absPos = localPos*parent.absScale + parent.absPos;
	absRotationCentroid = rotationCentroid * parent.absScale;

	if (parent.absRotation != 0) {
		// rotate around parent's center

		// calculate distance vector between local center and parent's center
		ofVec2f distanceVector = (absPos + absRotationCentroid) - (parent.absPos + parent.absRotationCentroid);
		float length = distanceVector.length();

		// calculate angle between local center and parent's center 
		float angle = parent.absRotation + (atan2f(distanceVector.y, distanceVector.x));

		// calculate rotation offset
		ofVec3f rotPos = ofVec3f(length*(cos(angle)), length*(sin(angle)), localPos.z);

		// calculate absolute position according to the parent's rotation origin
		absPos = parent.absPos + parent.absRotationCentroid + rotPos - absRotationCentroid;
	}
}

float Trans::CalcAngle(ofVec2f pos) {
	ofVec2f diff = pos - localPos;
	if (abs(diff.x) > 1E-3 || abs(diff.y) > 1E-3) {
		return RAD_TO_DEG*(atan2f(diff.x, -diff.y));
	}
	else return 0;
}

void Trans::SetRotationAsAngleToPosition(ofVec2f pos) {
	this->rotation = CalcAngle(pos);
}

ofMatrix4x4 Trans::CalcAbsMatrix() {
	ofMatrix4x4 matrix;

	// translate to the center
	matrix.translate(-absRotationCentroid / absScale);
	// rotate around centroid
	matrix.rotate(ofRadToDeg(absRotation), 0, 0, 1);
	// translate back -> object will be at the same location but rotated
	matrix.translate(absRotationCentroid / absScale);
	// scale and translate to the desired location
	matrix.scale(absScale);
	matrix.translate(absPos);

	return matrix;
}

ofMatrix4x4 Trans::CalcMatrix() {
	ofMatrix4x4 matrix;
	matrix.translate(-rotationCentroid*absScale);
	matrix.rotate(rotation, 0, 0, 1);
	matrix.translate(rotationCentroid*absScale);


	matrix.scale(scale);
	matrix.translate(localPos);

	return matrix;
}
