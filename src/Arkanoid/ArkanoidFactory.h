#pragma once

namespace luabridge {
	struct lua_State;
}


// forward decl
class GameObject;
class ArkanoidModel;

class ArkanoidIntroComponent;
class ArkanoidLifeComponent;
class ArkanoidSoundComponent;
class BallCollisionComponent;
class BrickCollisionComponent;
class GameComponent;
class PaddleComponent;

class ArkanoidFactory {
public:
	/**
	 * Initializes level that is set in the ArkanoidModel
	 */
	static void InitializeLevel(GameObject* rootObject, ArkanoidModel* model, jsonxx::Object& gameConfig);

protected:

	static void LoadGameConfig(GameObject* rootObject, ArkanoidModel* model, jsonxx::Object& gameConfig);

	static void AddIntro(GameObject* root, ArkanoidModel* model);

	static void AddBricks(GameObject* rootObject, ArkanoidModel* model);

	static void AddPanels(GameObject* root, ArkanoidModel* model);

	static void AddPaddle(GameObject* root, ArkanoidModel* model);

	static void AddLives(GameObject* root, ArkanoidModel* model);

	static void AddStatus(GameObject* root, ArkanoidModel* model);
public:
	static void InitLuaMapping(luabridge::lua_State* L);

private:
	static Component* CreateArkanoidIntroComponent();
	static Component* CreateArkanoidLifeComponent();
	static Component* CreateArkanoidSoundComponent();
	static Component* CreateArkanoidStatusComponent();
	static Component* CreateBallCollisionComponent();
	static Component* CreatePaddleComponent();
	static Component* CreateBrickCollisionComponent();
	static Component* CreateGameComponent();
};
