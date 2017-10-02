#pragma once

#include "ofMain.h"

/**
 * Example that transforms a picture into a 3D mesh
 */
class StarsExample : public ofBaseApp{
	public:
		// simple 3D camera
		ofEasyCam easyCam;
		ofImage image;
		ofMesh mesh;
		vector<ofVec3f> offsets;

		void setup();
		void update();
		void draw();
};
