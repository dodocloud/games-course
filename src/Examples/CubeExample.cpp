#include "CubeExample.h"
#include "AphUtils.h"


void CubeExample::setup() {
	// init video grabber and the mesh
	vid.initGrabber(w, h);
	mesh.setMode(OF_PRIMITIVE_POINTS);
	mesh.addVertices(vector<ofVec3f>(n));
	mesh.addColors(vector<ofFloatColor>(n));
}

void CubeExample::update() {
	vid.update();
	if (vid.isFrameNew()) {
		auto pix = vid.getPixels();
		int j = 0;
		for (int i = 0; i < n; i++) {
			unsigned char& r = pix[j++];
			unsigned char& g = pix[j++];
			unsigned char& b = pix[j++];
			mesh.setVertex(i, ofVec3f(r, g, b));
			mesh.setColor(i, ofColor(r, g, b));
		}
	}
}

void CubeExample::draw() {
	ofBackground(0);
	cam.begin();
	ofNoFill();
	ofDrawBox(0, 0, 0, 256, 256, 256);
	ofTranslate(-128, -128, -128);
	mesh.draw();
	cam.end();
}