#pragma once
#include "AIConstants.h"
#include "Vec2i.h"

// forward decl
class GameObject;
class AIModel;

class AIAgentsFactory {
public:

	static AIModel* LoadGameModel(int aiMap[AIMAP_WIDTH][AIMAP_HEIGHT]);

	static void InitializeGame(GameObject* rootObject, AIModel* model);

	static void CreateAgent(GameObject* owner, AIModel* model, Vec2i position);
};
