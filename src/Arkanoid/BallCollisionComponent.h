#pragma once

#include "SteeringComponent.h"
#include "StrId.h"
#include "Component.h"
#include "SteeringMath.h"
#include "AphMain.h"
#include "GameObject.h"
#include "SteeringComponent.h"
#include "Scene.h"

/**
 * Component that handles collisions with the ball
 */
class BallCollisionComponent : public Component {
public:

	GameObject* leftPanel;
	GameObject* rightPanel;
	GameObject* topPanel;
	GameObject* paddle;
	GameObject* bricks;
	ArkanoidModel* model;
	Dynamics* dynamics;

	virtual void Init() {
		leftPanel = owner->GetScene()->FindGameObjectByName("left_panel");
		rightPanel = owner->GetScene()->FindGameObjectByName("right_panel");
		topPanel = owner->GetScene()->FindGameObjectByName("top_panel");
		paddle = owner->GetScene()->FindGameObjectByName("paddle");
		bricks = owner->GetScene()->FindGameObjectByName("bricks");
		model = owner->GetRoot()->GetAttr<ArkanoidModel*>(ARKANOID_MODEL);
		dynamics = owner->GetAttr<Dynamics*>(ATTR_DYNAMICS);
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {
		
		if (dynamics->GetVelocity().lengthSquared() < 0.5f) {
			// zero velocity -> nothing to check
			return;
		}

		HitInfo hitInfo;
		bool hit = 
			CheckPanelCollision(hitInfo) || 
			CheckPaddleCollision(hitInfo) || 
			CheckBrickCollision(hitInfo);

		if (hit) {
			SendMsg(ARK_EVENT_OBJECT_HIT, &hitInfo);
		}

		// check the bottom as well
		if (owner->GetTransform().localPos.y >= 26) { // scene is scaled to be 25 units of height
			SendMsg(ARK_EVENT_BALL_OUTSIDE_AREA);
		}
	}

	/**
	 * Checks collision with all three panels
	 */
	bool CheckPanelCollision(HitInfo& hitInfo) const {
		auto& ballBB = owner->GetRenderable()->GetBoundingBox();
		auto& leftPanelBB = leftPanel->GetRenderable()->GetBoundingBox();
		auto& rightPanelBB = rightPanel->GetRenderable()->GetBoundingBox();
		auto& topPanelBB = topPanel->GetRenderable()->GetBoundingBox();
		
		if (ballBB.Intersects(topPanelBB) && dynamics->GetVelocity().y < 0) {
			dynamics->GetVelocity().y *= -1;
			hitInfo.hitType = HIT_TYPE_BORDER;
			return true;
		}

		if (ballBB.Intersects(leftPanelBB) && dynamics->GetVelocity().x < 0) {
			dynamics->GetVelocity().x *= -1;
			hitInfo.hitType = HIT_TYPE_BORDER;
			return true;
		}

		if (ballBB.Intersects(rightPanelBB) && dynamics->GetVelocity().x > 0) {
			hitInfo.hitType = HIT_TYPE_BORDER;
			dynamics->GetVelocity().x *= -1;
			return true;
		}
		return false;
	}

	/**
	 * Checks collision with the paddle
	 */
	bool CheckPaddleCollision(HitInfo& hitInfo) const {
		auto& paddleBB = paddle->GetRenderable()->GetBoundingBox();
		auto& ballBB = owner->GetRenderable()->GetBoundingBox();

		if (model->ballReleased && ballBB.Intersects(paddleBB) && dynamics->GetVelocity().y > 0) {
			
			// velocity of the paddle isn't taken into account
			float maxDistanceFromCenter = paddleBB.GetSize().x / 2;
			if (maxDistanceFromCenter != 0) {
				float distFromCenter = ballBB.GetCenter().x - paddleBB.GetCenter().x;
				float percDist = distFromCenter / maxDistanceFromCenter;

				float angle = PI / 4 * percDist;  // 45° max
				auto length = dynamics->GetVelocity().length();

				dynamics->GetVelocity().x = length * sin(angle);
				dynamics->GetVelocity().y = -length * cos(angle);
				hitInfo.hitType = HIT_TYPE_PADDLE;
				return true;
			}
		}
		return false;
	}

	/**
	 * Checks collision with all bricks
	 */
	bool CheckBrickCollision(HitInfo& hitInfo) const {

		auto& ballBB = owner->GetRenderable()->GetBoundingBox();
		auto multiMesh = bricks->GetMesh<MultiSpriteMesh>();
		auto& sprites = multiMesh->GetSprites();
		auto& velocity = dynamics->GetVelocity();

		for (int i = 0; i < sprites.size(); i++) {
			BoundingBox bb;
			Sprite* spr = sprites[i];
			spr->CalcBoundingBox(bb);
			
			if (bb.Intersects(ballBB)) {
				if (bb.HorizontalIntersection(ballBB) > bb.VerticalIntersection(ballBB)) {
					
					// check whether the ball is really heading in the wrong direction
					if((bb.bottomLeft.y > ballBB.topLeft.y && bb.topLeft.y < ballBB.topLeft.y && velocity.y < 0) 
						|| (bb.topLeft.y < ballBB.bottomLeft.y && bb.bottomLeft.y > ballBB.bottomLeft.y && velocity.y > 0)) {
						velocity.y *= -1;
					}
				}
				else {
					if ((bb.bottomRight.x > ballBB.bottomLeft.x && bb.bottomLeft.x < ballBB.bottomLeft.x && velocity.x < 0)
						|| (bb.bottomLeft.x < ballBB.bottomRight.x && bb.bottomRight.x > ballBB.bottomRight.x && velocity.x > 0)) {
						velocity.x *= -1;
					}
				}

				hitInfo.hitIndex = i;
				hitInfo.hitType = HIT_TYPE_BLOCK;
				return true;
			}
		}
		return false;
	}
};