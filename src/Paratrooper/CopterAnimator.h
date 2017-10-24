#pragma once

#include "Component.h"
#include "CompValues.h"
#include "TransformBuilder.h"
#include "GameValues.h"
#include "Movement.h"

/**
 * Simple animator that switches between two images
 */
class CopterAnimator : public Component {
private:
	ofVec2f lastVelocity = ofVec2f(0);
public:

	virtual void Update(uint64_t delta, uint64_t absolute) {
		auto& movement = owner->GetAttr<Movement>(MOVEMENT);
		auto& velocity = movement.GetVelocity();

		if (ofSign(velocity.x) != ofSign(lastVelocity.x) || lastVelocity.x == 0) {
			if (velocity.x < 0) {
				// to the left
				owner->GetMesh<ImageMesh>()->SetImage(owner->GetContext()->GetImage(FILE_COPTER_LEFT));
			}
			else {
				// to the right
				owner->GetMesh<ImageMesh>()->SetImage(owner->GetContext()->GetImage(FILE_COPTER_RIGHT));
			}
		}

		this->lastVelocity = velocity;
	}
};