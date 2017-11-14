#pragma once

#include <vector>
#include "ofVec2f.h"
#include "ofVec3f.h"

using namespace std;


/**
* Segment on the path
*/
struct PathSegment {
	// starting position
	ofVec2f start;
	// final position
	ofVec2f end;
	// segment length
	float length;

	PathSegment(const ofVec2f & start, const ofVec2f & end);
	virtual ~PathSegment() {}

	void operator=(const PathSegment & segment);

	/**
	* Calculates 2D point on the segment with given distance
	*/
	ofVec2f CalcPointOnSegment(float distance) const;

	/**
	* Calculates distance to the nearest point on segment
	*/
	float CalcDistToNearestPoint(const ofVec2f & point) const;

	/**
	* Analyzes given point, calculates distance along segment and distance to the closest point
	* @param point point to analyze
	* @param minDist minimum distance to consider
	* @param closestPoint output value of the point on the segment, closest to the given 2D point
	* @param closestPointDist output value of the distance to the closest point on the segment
	*/
	void AnalyzePoint(const ofVec2f point, const float minDist, float& closestPoint, float& closestPointDist) const;

};


/**
* Sequence of line segments used in steering behaviors
*/
class Path {
private:
	// collection of segments
	vector<PathSegment> segments;
	// total length of the path
	float pathLength;
public:

	Path() {
		
	}

	/**
	* Creates a new path
	* @param firstSegmentStart starting point of the first segment
	* @param firstSegmentEnd ending point of the first segment
	*/
	Path(const ofVec2f& firstSegmentStart, const ofVec2f& firstSegmentEnd);

	void AddFirstSegment(const ofVec2f& firstSegmentStart, const ofVec2f& firstSegmentEnd);

	/**
	* Adds a new segment with given endpoint
	*/
	void AddSegment(const ofVec2f& endPoint);


	void CalcTargetPoint(int currentPointIndex, float radiusTolerance, const ofVec2f location, int& targetPointIndex, ofVec2f& targetLocation);

	/**
	* Calculates 2D position on the path due to the given 1D point on the path
	*/
	ofVec2f CalcPathPosition(float pathPoint);

	vector<PathSegment>& GetSegments() {
		return segments;
	}

	float GetPathLength() {
		return pathLength;
	}
};
