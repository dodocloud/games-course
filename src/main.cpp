#include "ofMain.h"
#include "StarsExample.h"
#include "GpuParticlesExample.h"
#include "CubeExample.h"
#include "ColorWaveExample.h"
#include "TwistExample.h"
#include "PacmanApp.h"


//========================================================================
int main( ){

	ofSetupOpenGL(800,400, OF_WINDOW);	
	ofRunApp(new PacmanApp());

}
