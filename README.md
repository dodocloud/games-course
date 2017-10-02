ofxAphLib - Library for MI-APH
=========

## How to start

* Clone content of this repository into your OpenFrameworks folder (OF/addons/ofxAph)
* Run the ProjectGenerator to create an empty project
* Select ofxAphLib as your addon
* Copy the **Data** folder into the bin directory of your new project
* Open your new project
* Try to run one of examples listed below:

```cpp

#include "ofMain.h"
#include "TwistExample.h"

int main( ){

	ofSetupOpenGL(1024,768, OF_WINDOW);
	ofRunApp(new TwistExample());

}



``` 


## Examples
* Stars
* Color wave
* CPU particles
* GPU particles
* 3D Cube
* 3D Twist 
