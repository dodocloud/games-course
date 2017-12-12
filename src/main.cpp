#include "ofMain.h"
#include "StarsExample.h"
#include "GpuParticlesExample.h"
#include "CubeExample.h"
#include "ColorWaveExample.h"
#include "TwistExample.h"
#include "PacmanApp.h"
#include "PerlinNoiseExample.h"
#include "AIAgentsApp.h"
#include "Homework2.h"
#include "AIAgentsApp.h"
#include "NetworkExample.h"

//========================================================================
int main( ){
	ofSetupOpenGL(1024,768, OF_WINDOW);
	ofRunApp(new NetworkExample());
}