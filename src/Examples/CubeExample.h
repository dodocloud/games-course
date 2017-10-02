#pragma once

#include "ofMain.h"

/**
 * Wired 3D cube
 */
class CubeExample : public ofBaseApp{
	public:
		ofEasyCam cam;
		ofVideoGrabber vid;
		ofMesh mesh;
		int w = 1280, h = 720;
		int n = w * h;

		void setup();
		void update();
		void draw();
		
};
