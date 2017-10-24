#pragma once

// forward decl
class GameObject;
class ParatrooperModel;

/**
 * Game object factory
 */
class ParatrooperFactory {
public:

	static ParatrooperModel* LoadGameModel();

	static void InitializeGame(GameObject* rootObject, ParatrooperModel* model);

	static void CreateProjectile(GameObject* canon, ParatrooperModel* model);

	static void CreateParatrooper(GameObject* owner, ParatrooperModel* model);

	static void CreateCopter(GameObject* owner, ParatrooperModel* model);
};
