#pragma once

#include "Component.h"
#include "GameValues.h"
#include "Dynamics.h"

/**
 * Component that controls movement of the projectile
 */
class ProjectileComponent : public Component {
public:
	virtual void Update(uint64_t delta, uint64_t absolute) {

		// update location
		auto dynamics = owner->GetAttr<Dynamics*>(ATTR_DYNAMICS);
		dynamics->UpdateVelocity(delta, owner->GetContext()->GetGameSpeed());
		auto deltaPos = dynamics->CalcDelta(delta, owner->GetContext()->GetGameSpeed());

		auto& trans = owner->GetTransform();
		trans.localPos.x += deltaPos.x;
		trans.localPos.y += deltaPos.y;

		auto virtualWidth = owner->GetContext()->GetVirtualWidth();
		auto virtualHeight = owner->GetContext()->GetVirtualHeight();

		// check boundaries
		auto& absPos = owner->GetTransform().absPos;

		if (absPos.x < 0 || absPos.x > virtualWidth || absPos.y < 0 || absPos.y > virtualHeight) {
			// we are behind the screen -> remove projectile
			owner->Remove();
		}
	}
};
