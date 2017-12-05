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

	bool Intersects(BoundingBox& other) const {
		return HorizontalIntersection(other) >= 0 &&
			VerticalIntersection(other) >= 0;
	}

	float HorizontalIntersection(BoundingBox& other) const {
		return min(other.topRight.x, topRight.x) - max(other.topLeft.x, topLeft.x);
	}

	float VerticalIntersection(BoundingBox& other) const {
		return min(other.bottomLeft.y, bottomLeft.y) - max(other.topLeft.y, topLeft.y);
	}


};