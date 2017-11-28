#pragma once

#include "Component.h"
#include "CompValues.h"
#include "TransformBuilder.h"
#include "GameValues.h"
#include "Scene.h"

/**
 * Trigger that holds both unit and its colliding projectile
 */
struct CollisionTrigger {
	GameObject* unit;
	GameObject* projectile;
};

/**
 * Manager that handles collisions
 */
class CollisionManager : public Component {
private:
	vector<GameObject*> units; // list of all units
	vector<GameObject*> projectiles; // list of all projectiles
public:

	virtual void Init() {
		// we need to refresh both collections whenever a game object is either
		// added or removed. A bit ineffective, however... what the hell
		RegisterSubscriber(OBJECT_ADDED);
		RegisterSubscriber(OBJECT_REMOVED);
	}

	virtual void OnMessage(Msg& msg) {
		if (msg.GetAction() == OBJECT_ADDED || msg.GetAction() == OBJECT_REMOVED) {
			projectiles.clear();
			units.clear();
			// refresh both collections
			owner->GetScene()->FindGameObjectsByFlag(FLAG_PROJECTILE, projectiles);
			owner->GetScene()->FindGameObjectsByFlag(FLAG_COLLIDABLE, units);
		}
	}


	virtual void Update(uint64_t delta, uint64_t absolute) {

		vector<CollisionTrigger*> collides;

		// O(m^n), we don't suppose there will be more than 50 units in total
		for (auto projectile : projectiles) {
			if (!projectile->HasFlag(FLAG_DEAD)) {
				for (auto unit : units) {
					if (!unit->HasFlag(FLAG_DEAD)) {
						if (Collides(projectile, unit)) {
							ofLogNotice("CollisionManager", "Collision with %s", unit->GetName().c_str());
							collides.push_back(new CollisionTrigger{ unit, projectile });
						}
					}
				}
			}
		}

		// for each colliding pair, send a message
		for (auto collid : collides) {
			SendMsg(COLLISION, collid);
			delete collid;
		}
	}

private:
	bool Collides(GameObject* projectile, GameObject* unit) {
		auto& unitBB = unit->GetRenderable()->GetBoundingBox();
		
		auto& projTrans = projectile->GetTransform();
		
		// check bounding boxes
		return projTrans.absPos.x >= unitBB.topLeft.x && projTrans.absPos.x <= unitBB.topRight.x &&
			projTrans.absPos.y >= unitBB.topLeft.y && projTrans.absPos.y <= unitBB.bottomLeft.y;
	}
};