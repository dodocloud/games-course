#include "ofMain.h"
#include "StarsExample.h"
#include "GpuParticlesExample.h"
#include "CubeExample.h"
#include "ColorWaveExample.h"
#include "TwistExample.h"
#include "CpuParticlesExample.h"

//========================================================================
int main( ){

	ofSetupOpenGL(1024,768, OF_WINDOW);			// <-------- setup the GL context

	// this kicks off the running of my app
	// can be OF_WINDOW or OF_FULLSCREEN
	// pass in width and height too:
	ofRunApp(new StarsExample());

}
