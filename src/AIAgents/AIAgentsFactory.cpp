#include "TransformBuilder.h"
#include "jsonxx.h"
#include "AIAgentsFactory.h"
#include "SpriteSheetBuilder.h"
#include "AIConstants.h"
#include "AIModel.h"
#include "SteeringComponent.h"
#include "AgentAnimComponent.h"
#include "AgentAIComponent.h"
#include "WarehouseComponent.h"
#include "WarehouseStateComponent.h"

using namespace jsonxx;

AIModel* AIAgentsFactory::LoadGameModel(int aiMap[AIMAP_WIDTH][AIMAP_HEIGHT]) {
	
	// just transform 2D array that represents the map into an object
	auto model = new AIModel();
	model->map.width = AIMAP_WIDTH;
	model->map.height = AIMAP_HEIGHT;

	for (int i = 0; i < AIMAP_WIDTH; i++) {
		for (int j = 0; j < AIMAP_HEIGHT; j++) {
			auto mapBlock = aiMap[i][j];
			MapBlock block;
			block.x = i;
			block.y = j;
			block.type = mapBlock;
			model->map.SetBlock(i, j, block);
		}
	}

	// init grid in order to be able to search via AStar algorithm
	model->map.InitGridMap();
	return model;
}

void AIAgentsFactory::InitializeGame(GameObject* rootObject, AIModel* model) {

	auto scene = rootObject->GetScene();
	auto context = rootObject->GetContext();

	// build sprites
	SpriteSheetBuilder builder;
	auto spritesImage = context->GetImage(FILE_SPRITES);
	model->spriteSheet = builder.Image(spritesImage).Offset(0, 0).SpriteSize(128, 128).Frames(12).BuildAndReset();
	
	TransformBuilder trBld;

	// create mesh for map
	auto mapMesh = new MultiSpriteMesh("spriteLayer");
	auto map = new GameObject("map", context, scene, mapMesh); // no components -> just a crate for map sprites

	// for debugging only -> crate for dot sprites that can be used to render current path
	auto pathMesh = new MultiSpriteMesh("spriteLayer");
	auto mapPaths = new GameObject("mappaths", context, scene, pathMesh);
	pathMesh->GetTransform().localPos.z = 20;

	rootObject->AddChild(map);
	rootObject->AddChild(mapPaths);
	rootObject->AddAttr(AI_MODEL, model);
	// we have only one warehouse and therefore it isn't necessary to create a special object for it. Warehouse
	// is rendered via map object that keeps all sprites of the map
	rootObject->AddComponent(new WarehouseComponent());


	// add sprites
	for (int i = 0; i < AIMAP_WIDTH; i++) {
		for (int j = 0; j < AIMAP_HEIGHT; j++) {
			auto mapType = model->map.GetBlock(i, j).type;
			int index;

			// transform block index into sprite index
			switch(mapType) {
			case MAP_BLOCK_PATH:
				index = 8;
				break;
			case MAP_BLOCK_WALL:
				index = 9;
				break;
			case MAP_BLOCK_WAREHOUSE:
				index = 10;
				break;
			case MAP_BLOCK_ORE:
				index = 11;
				break;
			case MAP_BLOCK_PETROL:
				index = 12;
				break;
			}

			// warehouse
			if(mapType == MAP_BLOCK_WAREHOUSE) {
				model->warehouseModel.position = Vec2i(i, j);
			}

			Trans transform;
			Sprite* mapSprite = new Sprite(model->spriteSheet, index, transform);
			mapSprite->GetTransform().localPos.x = i * mapSprite->GetWidth();
			mapSprite->GetTransform().localPos.y = j * mapSprite->GetHeight();
			mapMesh->AddSprite(mapSprite);
		}
	}

	// recalculate boundaries of the multi sprite mesh so that we can use TransformBuilder to set proper position
	mapMesh->Recalc();

	// height of the map is equal to the height of the screen
	float aspectRatio = context->GetVirtualWidth() * 1.0f / context->GetVirtualHeight();
	trBld.RelativePosition(0, 0).RelativeScale(1.0f / aspectRatio, 1).BuildAndReset(map);
	pathMesh->GetTransform().scale = map->GetTransform().scale;


	// load font for warehouse status info
	auto font = new ofTrueTypeFont();
	font->load(FILE_FONT, 20);
	auto statusText = new Text(font);
	auto status = new GameObject("status", context, scene, statusText);
	rootObject->AddChild(status);
	// this component could be in the root. However, we need a TEXT mesh to render the text. That's why we create a special object for it.
	status->AddComponent(new WarehouseStateComponent());
	
	// place the status next to the map
	status->GetTransform().localPos.x = 105;
	status->GetTransform().localPos.y = 5;
	status->GetTransform().scale = 1.0f/rootObject->GetTransform().scale; // this changes the absolute scale to (1,1,1)
	status->GetTransform().scale.z = 1.0f;
}

void AIAgentsFactory::CreateAgent(GameObject* owner, AIModel* model, Vec2i position) {
	
	auto context = owner->GetContext();
	auto scene = owner->GetScene();

	// choose type randomly (besides color, there is no difference)
	AgentType type = AgentType::BLUE;

	if(ofRandomf() > 0.1f) {
		type = AgentType::RED;
	}
	
	auto sprite = Sprite(model->spriteSheet, type == AgentType::BLUE ? 0 : 4);
	auto agent = new GameObject("agent", context, scene, new SpriteMesh(sprite, "spriteLayer"));
	owner->AddChild(agent);

	// create movement attribute for dynamics
	auto movement = Movement();
	agent->AddAttr(ATTR_MOVEMENT, movement);

	// create model with random speed
	auto agentModel = new AgentModel();
	agentModel->speed = ofRandom(5, 35);
	agentModel->agentType = type;
	agent->AddAttr(ATTR_AGENTMODEL, agentModel);

	agent->AddComponent(new AIMovementComponent());
	agent->AddComponent(new AgentAnimComponent());
	agent->AddComponent(new AgentAIComponent());
	
	// the scale will be equal to 10% of the height of the screen
	TransformBuilder trBld;
	trBld.RelativePosition(0.5f, 0.5f).ZIndex(10).Anchor(0.5f, 0.5f).RelativeScale(0, 0.1f).BuildAndReset(agent);

	// 
	auto location = model->map.MapBlockToLocation(position.x, position.y);
	agent->GetTransform().localPos.x = location.x;
	agent->GetTransform().localPos.y = location.y;
}