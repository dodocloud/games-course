#pragma once

#include "Component.h"
#include "CompValues.h"
#include "TransformBuilder.h"
#include "ParatrooperModel.h"
#include "GameValues.h"

/**
 * Component that only renders score label
 */
class ScoreComponent : public Component {
public:
	virtual void Update(uint64_t delta, uint64_t absolute) {
		auto root = owner->GetRoot();
		auto model = root->GetAttr<ParatrooperModel*>(MODEL);

		string scoreStr = "SCORE: " + ofToString(model->score);
		owner->GetMesh<Text>()->SetText(scoreStr);
	}
};

/**
 * Component that displays number of lives
 */
class LivesComponent : public Component {
public:
	virtual void Update(uint64_t delta, uint64_t absolute) {
		auto root = owner->GetRoot();
		auto model = root->GetAttr<ParatrooperModel*>(MODEL);

		string str = "LIVES: " + ofToString(max(0,model->maxLandedUnits - model->landedUnits));
		owner->GetMesh<Text>()->SetText(str);
	}
};
