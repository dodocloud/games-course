#include "AphUtils.h"

bool CheckAPHVersion() {
	auto path = ofToDataPath("version.txt");
	auto file = ofFile(path);

	if(!file.exists()) {
		ofLogError("APH", "version.txt not found. Make sure you copied the data folder from ofxAphLib addon into your bin folder.");
		return false;
	}

	auto fileContent = file.readToBuffer().getText();
	auto version = ofToInt(fileContent);

	if(version != CURRENT_VERSION) {
		ofLogError("APH", "version.txt contains wrong version. The current version is %d. Make sure you copied the data folder from ofxAphLib addon into your bin folder.", CURRENT_VERSION);
		return false;
	}

	return true;
}