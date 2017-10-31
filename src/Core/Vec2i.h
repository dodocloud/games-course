#pragma once

#include "ofVec2f.h"
#include "ofVec3f.h"


/**
* 2D vector of integers since OpenFrameworks doesn't provide them
*/
struct Vec2i {

	// position on the x axis 
	int x;
	// position on the y axis
	int y;

	Vec2i() : x(0), y(0) {

	}

	Vec2i(int xy) : x(xy), y(xy) {

	}

	Vec2i(int x, int y) : x(x), y(y) {

	}

	Vec2i(const Vec2i& copy) {
		x = copy.x;
		y = copy.y;
	}

	Vec2i(ofVec2f pos) : x(pos.x), y(pos.y) {

	}

	Vec2i(ofVec3f pos) : x(pos.x), y(pos.y) {

	}


	inline operator size_t() const {
		// prime number
		return x * 1812433253 + y;
	}

	inline operator ofVec2f() const {
		return ofVec2f(float(x), (float)y);
	}

	inline operator ofVec3f() const {
		return ofVec3f(float(x), (float)y);
	}

	inline bool operator==(const Vec2i& a) const {
		return x == a.x && y == a.y;
	}

	inline bool operator==(const int& a) const {
		return x == a && y == a;
	}

	inline bool operator!=(const Vec2i& a) const {
		return x != a.x || y != a.y;
	}

	inline bool operator<(const Vec2i& a) const {
		return ((size_t)*this) < ((size_t)a);
	}

	inline bool operator>(const Vec2i& a) const {
		return ((size_t)*this) > ((size_t)a);
	}

	inline Vec2i operator+(const Vec2i& a) const {
		return Vec2i(a.x + x, a.y + y);
	}

	inline Vec2i operator-(const Vec2i& a) const {
		return Vec2i(x - a.x, y - a.y);
	}

	/**
	* Calculates manhattan distance between two vectors
	*/
	static int ManhattanDist(const Vec2i& a, const Vec2i& b) {
		return abs(a.x - b.x) + abs(a.y - b.y);
	}

	/**
	* Calculates Euclidean distance between two vectors, returns integer
	*/
	static int Distance(const Vec2i& a, const Vec2i& b) {
		return sqrt((a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y));
	}

	/**
	* Calculates Euclidean distance between two vectors, returns float
	*/
	static float Distancef(const Vec2i& a, const Vec2i& b) {
		return sqrt((a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y));
	}

	/**
	* Calculates manhattan distance to other vector
	*/
	int ManhattanDist(const Vec2i& a) {
		return abs(a.x - x) + abs(a.y - y);
	}

	/**
	* Calculates euclidean distance to other vector, returns integer
	*/
	int Distance(const Vec2i& a) {
		return sqrt((a.x - x)*(a.x - x) + (a.y - y)*(a.y - y));
	}

	/**
	* Calculates euclidean distance to other vector, returns float
	*/
	float Distancef(const Vec2i& a) {
		return sqrt((a.x - x)*(a.x - x) + (a.y - y)*(a.y - y));
	}
};


namespace std {
	// overriding hash function for position
	template <>
	struct hash<Vec2i> {
		inline size_t operator()(const Vec2i& pos) const {
			return pos.x * 1812433253 + pos.y;
		}
	};
}

