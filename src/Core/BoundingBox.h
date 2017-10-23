#pragma once
#include "ofVec2f.h"

/**
 * Structure that keeps data about bounding box
 * of a certain object
 */
struct BoundingBox {
	ofVec2f topLeft = ofVec2f(0, 0);
	ofVec2f topRight = ofVec2f(0, 0);
	ofVec2f bottomLeft = ofVec2f(0, 0);
	ofVec2f bottomRight = ofVec2f(0, 0);

	ofVec2f GetSize() const {
		return bottomRight - topLeft;
	}

	ofVec2f GetCenter() const {
		return topLeft + GetSize() / 2;
	}
};