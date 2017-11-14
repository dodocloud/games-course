#include "Path.h"


// ========================= PATH SEGMENT ==============================

void PathSegment::operator=(const PathSegment & segment) {
	this->start = segment.start;
	this->end = segment.end;
	this->length = segment.length;
}

PathSegment::PathSegment(const ofVec2f & start, const ofVec2f & end) : start(start), end(end) {
	length = (end - start).length();
}

ofVec2f PathSegment::CalcPointOnSegment(float distance) const {
	float percentLength = distance / length;
	float percentStart = 1 - percentLength;
	return percentStart * start + percentLength * end;
}

float PathSegment::CalcDistToNearestPoint(const ofVec2f & point) const {
	// closer to start ( x  ------- )
	if ((point - start).dot(end - start) < 0) return 0;

	// closer to end ( ------- x)
	if ((point - end).dot(start - end) < 0) return length;

	// closer to point between start and end ( ------ x ------ )
	return (end - start).dot(point - start) / length;
}

void PathSegment::AnalyzePoint(const ofVec2f point, const float minDist, float& closestPoint, float& closestPointDist) const {
	closestPoint = CalcDistToNearestPoint(point);

	if (closestPoint < minDist) closestPoint = minDist;


	// calculate 2D point the segmentPoint represents
	ofVec2f closest2DPoint = CalcPointOnSegment(closestPoint);
	// calculate distance between point and closestPoint
	closestPointDist = (closest2DPoint - point).length();
}

// ========================= PATH ==============================

Path::Path(const ofVec2f& firstSegmentStart, const ofVec2f& firstSegmentEnd) {
	AddFirstSegment(firstSegmentStart, firstSegmentEnd);
}

void Path::AddFirstSegment(const ofVec2f& firstSegmentStart, const ofVec2f& firstSegmentEnd) {
	// clear all segments
	segments.clear();

	PathSegment firstSegment(firstSegmentStart, firstSegmentEnd);
	segments.push_back(firstSegment);
	pathLength = firstSegment.length;
}

void Path::AddSegment(const ofVec2f& segmentEndPoint) {
	// connect the segment to the last one
	PathSegment segment(segments.back().end, segmentEndPoint);
	segments.push_back(segment);
	// increment total length of the path
	pathLength += segment.length;
}

void Path::CalcTargetPoint(int currentPointIndex, float radiusTolerance, const ofVec2f location, int& targetPointIndex, ofVec2f& targetLocation) {

	auto currentSegment = segments[currentPointIndex != -1 ? currentPointIndex : 0];

	if (currentPointIndex == -1 && location.distance(currentSegment.start) > radiusTolerance) {
		targetPointIndex = -1; // not yet at the beginning
		targetLocation = currentSegment.start;
		return;
	}

	if(location.distance(currentSegment.end) > radiusTolerance) {
		// go to the end of the segment
		targetPointIndex = currentPointIndex;
		targetLocation = currentSegment.end;
		return;
	} else {
		if(currentPointIndex == segments.size() - 1) {
			// finish
			targetPointIndex = currentPointIndex;
			targetLocation = location; // stay where you are
		}else {
			// go to the end of the next segment
			targetPointIndex = currentPointIndex + 1;
			targetLocation = segments[targetPointIndex].end;
		}

		return;
	}
}

ofVec2f Path::CalcPathPosition(float pathPoint) {
	for (auto& seg : segments) {
		if (pathPoint < seg.length) return seg.CalcPointOnSegment(pathPoint);
		pathPoint -= seg.length;
	}

	// there is no such point...
	return segments.back().end;
}

