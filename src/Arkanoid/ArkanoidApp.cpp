
#include "ArkanoidApp.h"
#include "AphUtils.h"
#include "ofLog.h"
#include "ScriptManager.h"
#include "ArkanoidFactory.h"
#include "CollisionManager.h"
#include "ArkanoidConstants.h"

//--------------------------------------------------------------
void ArkanoidApp::Init() {
	
	// init sounds
	LoadSound(FILE_SOUND_HIT);
	LoadSound(FILE_SOUND_ROUND);
	LoadSound(FILE_SOUND_GAME_OVER);
	LoadSound(FILE_SOUND_GAME_START);

	// load config
	ifstream fin;
	fin.open(ofToDataPath("Examples/Arkanoid/data.json").c_str());
	gameConfig.parse(fin);
	fin.close();

	// create model
	model = new ArkanoidModel();

	// load sprite atlas
	auto spritesImage = this->GetImage("Examples/arkanoid/arkanoid.png");
	renderer->AddTileLayer(spritesImage, "spriteLayer", 5000, 1);
	
	// set scale factor so that the whole scene will have height of 25 units
	float desiredSceneHeight = 25.0f;
	float autoScale = ofGetWindowSize().y / desiredSceneHeight;
	this->meshDefaultScale = 1.0f / autoScale * (ofGetWindowSize().y / 400.0f);
	rootBorder = new FRect(ofGetWindowSize().x / autoScale, ofGetWindowSize().y / autoScale, ofColor(0));
	rootBorder->SetIsRenderable(false);

	auto scripts = ScriptManager::GetInstance();
	scripts->Init();
	scripts->LoadScript(ofFile(string_format("%s/Arkanoid.lua", SCRIPTS_PATH)));
	ArkanoidFactory::InitLuaMapping(ScriptManager::GetInstance()->GetLua());
}

void ArkanoidApp::Reset() {
	if(scene->GetRootObject() != nullptr) {
		delete scene->GetRootObject();
	}
	
	model->InitLevel();
	auto rootObject = new GameObject("root", this, scene, rootBorder);
	scene->SetRootObject(rootObject);;
	ArkanoidFactory::InitializeLevel(rootObject, model, gameConfig);
}

int ArkanoidApp::GetMappedKey(StrId action) {
	if (action == ARK_ACTION_LEFT) return OF_KEY_LEFT;
	if (action == ARK_ACTION_RIGHT) return OF_KEY_RIGHT;
	if (action == ARK_ACTION_RELEASE) return OF_KEY_ALT;
	return 0;
}