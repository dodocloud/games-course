#include "ScriptManager.h"
#include "TransformBuilder.h"
#include "jsonxx.h"
#include "ArkanoidFactory.h"
#include "SpriteSheetBuilder.h"
#undef None // LuaBridge is polluting Ubuntu's global namespace
#include <LuaBridge.h>
#include "GameObject.h"
#include "ComponentLua.h"
#include "List.h"
#include "ArkanoidModel.h"
#include "ArkanoidConstants.h"
#include "PaddleComponent.h"
#include "BallCollisionComponent.h"
#include "ArkanoidSoundComponent.h"
#include "GameComponent.h"
#include "ArkanoidStatusComponent.h"
#include "ArkanoidIntroComponent.h"
#include "ArkanoidLifeComponent.h"
#include "BrickCollisionComponent.h"

using namespace jsonxx;

void ArkanoidFactory::InitializeLevel(GameObject* rootObject, ArkanoidModel* model, jsonxx::Object& gameConfig) {
	LoadGameConfig(rootObject, model, gameConfig);

	if (model->currentLevel == 0) {
		AddIntro(rootObject, model);
	}
	else {
		AddPanels(rootObject, model);
		AddBricks(rootObject, model);
		AddPaddle(rootObject, model);
		AddLives(rootObject, model);
		AddStatus(rootObject, model);

		rootObject->AddComponent(CreateArkanoidSoundComponent());
		rootObject->AddComponent(CreateBrickCollisionComponent());
		rootObject->AddComponent(CreateGameComponent());
	}
}

void ArkanoidFactory::AddIntro(GameObject* root, ArkanoidModel* model) {
	TransformBuilder trBld;

	auto scene = root->GetScene();
	auto context = root->GetContext();

	// add title
	auto titleSpr = Sprite(model->spriteSheets["title"], 0);
	auto titleMesh = new SpriteMesh(titleSpr, "spriteLayer");
	auto titleObj = new GameObject("title", context, scene, titleMesh);
	root->AddChild(titleObj);
	trBld.RelativePosition(0.5, 0.25).Anchor(0.5f, 0.5f).LocalScale(ofVec2f(context->GetMeshDefaultScale())).BuildAndReset(titleObj);

	// add ship sprite
	auto shipSpr = Sprite(model->spriteSheets["ship"], 0);
	auto shipMesh = new SpriteMesh(shipSpr, "spriteLayer");
	shipMesh->GetTransform().scale = ofVec3f(context->GetMeshDefaultScale());
	auto shipObj = new GameObject("ship", context, scene, shipMesh);
	root->AddChild(shipObj);
	trBld.RelativePosition(0.5f, 0.65f).Anchor(0.5f, 0.5f).LocalScale(ofVec2f(context->GetMeshDefaultScale())).BuildAndReset(shipObj);

	root->AddComponent(CreateArkanoidSoundComponent());
	root->AddComponent(CreateArkanoidIntroComponent());
}

void ArkanoidFactory::LoadGameConfig(GameObject* rootObject, ArkanoidModel* model, jsonxx::Object& gameConfig) {

	auto sprites = gameConfig.get<Array>("sprites");
	model->maxLevels = gameConfig.get<Number>("levels_total");
	model->maxLives = model->currentLives = gameConfig.get<Number>("max_lives");
	model->ballSpeed = gameConfig.get<Number>("ball_speed");
	model->ballSpeedMultiplier = gameConfig.get<Number>("ball_speed_multiplier");


	auto context = rootObject->GetContext();

	ofImage* atlas = context->GetImage("Examples/arkanoid/arkanoid.png");
	SpriteSheetBuilder bld;

	// add the main game model
	rootObject->AddAttr(ARKANOID_MODEL, model, true); // model should survive scene remove

	for (int i = 0; i < sprites.size(); i++) {
		// create sprite
		auto& spr = sprites.get<Object>(i);
		bld.Image(atlas);
		bld.LoadFromJson(spr);
		SpriteSheet* sheet = bld.BuildAndReset();
		model->spriteSheets[sheet->GetName()] = sheet;
	}

	if (model->currentLevel != 0) { // level 0 is intro

		// load level map
		auto level = gameConfig.get<Array>("levels_maps").get<Array>(model->currentLevel - 1);

		for (int i = 0; i < level.size(); i++) {
			auto& row = level.get<Array>(i);

			for (int j = 0; j < row.size(); j++) {
				int brickIndex = row.get<Number>(j);

				if (brickIndex != ARK_BRICK_NONE) { // 0 is for empty space
					// add a new brick
					Brick brick;
					brick.position = Vec2i(j, i);
					brick.type = brickIndex;
					model->bricks[brick.position] = brick;

					if (brickIndex != ARK_BRICK_INDESTRUCTIBLE) { // skip indestructible bricks
						model->remainingBricks++;
					}
				}
			}
		}
	}
}

void ArkanoidFactory::AddBricks(GameObject* rootObject, ArkanoidModel* model) {
	auto scene = rootObject->GetScene();
	auto context = rootObject->GetContext();

	auto brickMesh = new MultiSpriteMesh("spriteLayer");
	auto bricks = new GameObject("bricks", context, scene, brickMesh);

	for (auto& brick : model->bricks) {
		auto spriteIndex = brick.second.type - 1;

		Sprite* brickSpr = new Sprite(model->spriteSheets["blocks"], spriteIndex);
		brickSpr->GetTransform().localPos.x = brick.second.position.x * 2 + 1;
		brickSpr->GetTransform().localPos.y = brick.second.position.y + 1;
		brickSpr->GetTransform().scale = ofVec3f(context->GetMeshDefaultScale());
		brickMesh->AddSprite(brickSpr);

		// keep relation between Brick and its sprite, we will need it
		model->brickMap[brickSpr] = brick.second;
	}

	rootObject->AddChild(bricks);
}


void ArkanoidFactory::AddPanels(GameObject* rootObject, ArkanoidModel* model) {

	TransformBuilder trBld;

	auto scene = rootObject->GetScene();
	auto context = rootObject->GetContext();

	// left panel
	auto leftPanelSpr = Sprite(model->spriteSheets["left_panel"], 0);
	auto leftPanel = new SpriteMesh(leftPanelSpr, "spriteLayer");
	auto leftPanelObj = new GameObject("left_panel", context, scene, leftPanel);
	rootObject->AddChild(leftPanelObj);
	trBld.LocalPosition(0, 0).LocalScale(ofVec2f(context->GetMeshDefaultScale())).BuildAndReset(leftPanelObj);

	// right panel
	auto rightPanelSpr = Sprite(model->spriteSheets["right_panel"], 0);
	auto rightPanel = new SpriteMesh(rightPanelSpr, "spriteLayer");
	rightPanel->GetTransform().scale = ofVec3f(context->GetMeshDefaultScale());
	auto rightPanelObj = new GameObject("right_panel", context, scene, rightPanel);
	rootObject->AddChild(rightPanelObj);
	trBld.LocalPosition(23, 0).LocalScale(ofVec2f(context->GetMeshDefaultScale())).BuildAndReset(rightPanelObj);

	// top panel
	auto topPanelSpr = Sprite(model->spriteSheets["top_panel"], 0);
	auto topPanel = new SpriteMesh(topPanelSpr, "spriteLayer");
	topPanel->GetTransform().scale = ofVec3f(context->GetMeshDefaultScale());
	auto topPanelObj = new GameObject("top_panel", context, scene, topPanel);
	rootObject->AddChild(topPanelObj);
	trBld.LocalPosition(0, 0).LocalScale(ofVec2f(context->GetMeshDefaultScale())).BuildAndReset(topPanelObj);
}

void ArkanoidFactory::AddPaddle(GameObject* root, ArkanoidModel* model) {

	TransformBuilder trBld;

	auto scene = root->GetScene();
	auto context = root->GetContext();

	auto paddleSpr = Sprite(model->spriteSheets["paddle"], 0);
	auto paddleMesh = new SpriteMesh(paddleSpr, "spriteLayer");
	paddleMesh->GetTransform().scale = ofVec3f(context->GetMeshDefaultScale());
	auto paddleObj = new GameObject("paddle", context, scene, paddleMesh);
	root->AddChild(paddleObj);
	trBld.LocalPosition(10, 23).LocalScale(ofVec2f(context->GetMeshDefaultScale())).BuildAndReset(paddleObj);

	// add ball
	auto ballSpr = Sprite(model->spriteSheets["ball"], 0);
	auto ballMesh = new SpriteMesh(ballSpr, "spriteLayer");
	ballMesh->GetTransform().scale = ofVec3f(context->GetMeshDefaultScale());
	auto ballObj = new GameObject("ball", context, scene, ballMesh);
	root->AddChild(ballObj);

	// remember, the scene is scaled to 25 units of height
	trBld.LocalPosition(10.0 + model->ballOffset, 22.4f).LocalScale(ofVec2f(context->GetMeshDefaultScale())).BuildAndReset(ballObj);

	ballObj->AddComponent(new DynamicsComponent());			// ball movement
	ballObj->AddComponent(CreateBallCollisionComponent());	
	paddleObj->AddComponent(CreatePaddleComponent());	
}

void ArkanoidFactory::AddLives(GameObject* rootObject, ArkanoidModel* model) {
	TransformBuilder trBld;
	auto scene = rootObject->GetScene();
	auto context = rootObject->GetContext();

	// for each life, create a small paddle icon
	for (int i = 1; i <= model->currentLives; i++) {
		auto lifeSpr = Sprite(model->spriteSheets["life"], 0);
		auto lifeMesh = new SpriteMesh(lifeSpr, "spriteLayer");
		lifeMesh->GetTransform().scale = ofVec3f(context->GetMeshDefaultScale());
		auto lifeObj = new GameObject(string_format("life_%d", i), context, scene, lifeMesh);
		rootObject->AddChild(lifeObj);
		trBld.LocalPosition(1 + 2 * (i - 1), 24).LocalScale(ofVec2f(context->GetMeshDefaultScale())).BuildAndReset(lifeObj);
	}

	rootObject->AddComponent(CreateArkanoidLifeComponent()); 
}

void ArkanoidFactory::AddStatus(GameObject* rootObject, ArkanoidModel* model) {
	TransformBuilder trBld;
	auto scene = rootObject->GetScene();
	auto context = rootObject->GetContext();

	auto font = new ofTrueTypeFont();
	font->load("Examples/arkanoid/comfont.TTF", 20);

	auto status = new GameObject("status", context, scene, new Text(font));
	rootObject->AddChild(status);
	trBld.LocalPosition(8, 15).LocalScale(ofVec2f(context->GetMeshDefaultScale())).BuildAndReset(status);
	
	status->AddComponent(CreateArkanoidStatusComponent());
}

void ArkanoidFactory::InitLuaMapping(luabridge::lua_State* L) {


	luabridge::getGlobalNamespace(L)
		.beginClass<Brick>("Brick")
		.addData("position", &Brick::position)
		.addData("type", &Brick::type)
		.endClass();

	luabridge::getGlobalNamespace(L)
		.beginClass<ArkanoidModel>("ArkanoidModel")
		.addData("ballReleased", &ArkanoidModel::ballReleased)
		.addData("currentLevel", &ArkanoidModel::currentLevel)
		.addData("remainingBricks", &ArkanoidModel::remainingBricks)
		.addData("currentRound", &ArkanoidModel::currentRound)
		.addData("ballSpeed", &ArkanoidModel::ballSpeed)
		.addData("ballSpeedMultiplier", &ArkanoidModel::ballSpeedMultiplier)
		.addData("paddleSpeed", &ArkanoidModel::paddleSpeed)
		.addData("ballOffset", &ArkanoidModel::ballOffset)
		.addData("currentLives", &ArkanoidModel::currentLives)
		.addData("maxLives", &ArkanoidModel::maxLives)
		.addData("maxLevels", &ArkanoidModel::maxLevels)
		.addFunction("GetBrick", &ArkanoidModel::GetBrick)
		.addFunction("RemoveBrick", &ArkanoidModel::RemoveBrick)
		.endClass();

	luabridge::getGlobalNamespace(L)
		.beginClass<GameObject>("GameObject")
		.addFunction("GetAttr_ARKANOID_MODEL", reinterpret_cast<ArkanoidModel*(GameObject::*)()>(&GameObject::GetAttrPtrStatic<ARKANOID_MODEL>))
		.addFunction("GetAttr_DYNAMICS", reinterpret_cast<Dynamics*(GameObject::*)()>(&GameObject::GetAttrPtrStatic<ATTR_DYNAMICS>))
		.endClass();

	luabridge::getGlobalNamespace(L)
		.beginClass<HitInfo>("HitInfo")
		.addConstructor<void(*)()>()
		.addData("hitIndex", &HitInfo::hitIndex)
		.addData("hitType", &HitInfo::hitType)
		.endClass();


	luabridge::getGlobalNamespace(L)
		.beginClass<ComponentLua>("ComponentLua")
		.addFunction<void(ComponentLua::*)(StrId, HitInfo*)>("SendMsgWithData", reinterpret_cast<void(ComponentLua::*)(StrId, HitInfo*)>(&ComponentLua::SendMsgWithData))
		.endClass();

	luabridge::getGlobalNamespace(L)
		.beginClass<Msg>("Msg")
		.addFunction("GetData_HITINFO", reinterpret_cast<HitInfo*(Msg::*)()>(&Msg::GetData<HitInfo>))
		.endClass();
}


// ========================================================================================

Component* ArkanoidFactory::CreateArkanoidIntroComponent() {
	//return new ArkanoidIntroComponent();
	return ScriptManager::GetInstance()->CreateLuaComponent("ArkanoidIntroComponent");
}

Component* ArkanoidFactory::CreateArkanoidLifeComponent() {
	return new ArkanoidLifeComponent();
	//return ScriptManager::GetInstance()->CreateLuaComponent("ArkanoidLifeComponent");
}

Component* ArkanoidFactory::CreateArkanoidSoundComponent() {
	//return new ArkanoidSoundComponent();
	return ScriptManager::GetInstance()->CreateLuaComponent("ArkanoidSoundComponent");
}

Component* ArkanoidFactory::CreateArkanoidStatusComponent() {
	return new ArkanoidStatusComponent();
	//return ScriptManager::GetInstance()->CreateLuaComponent("ArkanoidStatusComponent");
}

Component* ArkanoidFactory::CreateBallCollisionComponent() {
	return new BallCollisionComponent();
	//return ScriptManager::GetInstance()->CreateLuaComponent("BallCollisionComponent");
}

Component* ArkanoidFactory::CreatePaddleComponent() {
	return new PaddleInputController();
	//return ScriptManager::GetInstance()->CreateLuaComponent("PaddleInputController");
}

Component* ArkanoidFactory::CreateBrickCollisionComponent() {
	return new BrickCollisionComponent();
	//return ScriptManager::GetInstance()->CreateLuaComponent("BrickCollisionComponent");
}

Component* ArkanoidFactory::CreateGameComponent() {
	return new GameComponent();
	//return ScriptManager::GetInstance()->CreateLuaComponent("GameComponent");
}
