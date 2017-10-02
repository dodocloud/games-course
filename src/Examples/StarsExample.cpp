#include "StarsExample.h"
#include "AphUtils.h"
//--------------------------------------------------------------
void StarsExample::setup(){
	if (CheckAPHVersion()) {

		ofSetFrameRate(60);

		// load image
		image.load("Examples/stars.png");
		image.resize(200, 200);

		mesh.setMode(OF_PRIMITIVE_LINES);
		mesh.enableIndices();

		float intensityThreshold = 150.0;
		int w = image.getWidth();
		int h = image.getHeight();

		// transform image into vertices
		for (int x = 0; x < w; ++x) {
			for (int y = 0; y < h; ++y) {
				ofColor c = image.getColor(x, y);
				float intensity = c.getLightness();
				if (intensity >= intensityThreshold) {
					// We shrunk our image by a factor of 4, so we need to multiply our pixel
					// locations by 4 in order to have our mesh cover the openFrameworks window
					ofVec3f pos(x * 4, y * 4, 0.0);
					mesh.addVertex(pos);
					mesh.addColor(c);
					// It will create a ofVec3f with 3 random values, which
					// will allow us to move the x, y and z coordinates of
					// each vertex independently
					offsets.push_back(ofVec3f(ofRandom(0, 100000), ofRandom(0, 100000), ofRandom(0, 100000)));
				}
			}
		}

		// Let's add some lines!
		float connectionDistance = 30;
		int numVerts = mesh.getNumVertices();
		for (int a = 0; a<numVerts; ++a) {
			ofVec3f verta = mesh.getVertex(a);
			for (int b = a + 1; b<numVerts; ++b) {
				ofVec3f vertb = mesh.getVertex(b);
				float distance = verta.distance(vertb);
				if (distance <= connectionDistance) {
					// In OF_PRIMITIVE_LINES, every pair of vertices or indices will be
					// connected to form a line
					mesh.addIndex(a);
					mesh.addIndex(b);
				}
			}
		}
	}
}

//--------------------------------------------------------------
void StarsExample::update(){
	int numVerts = mesh.getNumVertices();
	for (int i = 0; i<numVerts; ++i) {
		ofVec3f vert = mesh.getVertex(i);

		float time = ofGetElapsedTimef();
		float timeScale = 5.0;
		float displacementScale = 0.75;
		ofVec3f timeOffsets = offsets[i];

		// shift randomly. It's gonna look amazing!
		vert.x += (ofSignedNoise(time*timeScale + timeOffsets.x)) * displacementScale;
		vert.y += (ofSignedNoise(time*timeScale + timeOffsets.y)) * displacementScale;
		vert.z += (ofSignedNoise(time*timeScale + timeOffsets.z)) * displacementScale;
		mesh.setVertex(i, vert);
	}
}

//--------------------------------------------------------------
void StarsExample::draw(){

	ofColor centerColor = ofColor(85, 78, 68);
	ofColor edgeColor(0, 0, 0);
	ofBackgroundGradient(centerColor, edgeColor, OF_GRADIENT_CIRCULAR);

	easyCam.begin();
	ofPushMatrix();
	ofTranslate(-ofGetWidth() / 2, -ofGetHeight() / 2);
	// ..... magic!!! Draw the mesh
	mesh.draw();
	ofPopMatrix();
	easyCam.end();
}