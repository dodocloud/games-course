#pragma once

#include "ofMain.h"

/**
 * Nice 3D twist whose length grows randomly as the time passes
 */
class TwistExample : public ofBaseApp {
public:
	//The circle parameters
	float Rad = 25; 			//Radius of circle
	float circleStep = 3;		//Step size for circle motion
	int circleN = 40; 			//Number of points on the circle

								//Current circle state
	ofPoint pos;				//Circle center
	ofPoint axeX, axyY, axyZ;	//Circle's coordinate system


	void setup();
	void update();
	void draw();

	ofMesh mesh;		//Mesh
	ofLight light;		//Light
	void addRandomCircle(ofMesh &mesh); //Main function which
										//moves circle and adds triangles to the object

	//Universal function which sets normals
	//for the triangle mesh
	void setNormals(ofMesh &mesh);

};

