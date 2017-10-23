#pragma once
#include "ofVec2f.h"
#include "Transform.h"
#include "GameObject.h"


enum class CalcType {
	ABS, LOC, PER
};

class TransformBuilder {
private:
	ofVec2f pos;
	int zIndex;
	CalcType pType = CalcType::LOC;
	ofVec2f anchor;
	ofVec2f size;
	ofVec2f rotationCentroid;
	CalcType sType = CalcType::LOC;
	float rotation;
public:

	TransformBuilder() {
		SetDefaultVals();
	}

	TransformBuilder& ZIndex(int zIndex) {
		this->zIndex = zIndex;
		return *this;
	}

	TransformBuilder& Anchor(ofVec2f anchor) {
		this->anchor = anchor;
		return *this;
	}

	TransformBuilder& Anchor(float x, float y) {
		this->anchor = ofVec2f(x,y);
		return *this;
	}

	TransformBuilder& RotationCenter(ofVec2f centroid) {
		this->rotationCentroid = centroid;
		return *this;
	}

	TransformBuilder& RotationCenter(float x, float y) {
		this->rotationCentroid = ofVec2f(x,y);
		return *this;
	}

	TransformBuilder& Rotation(float rotation) {
		this->rotation = rotation;
		return *this;
	}

	TransformBuilder& AbsolutePosition(ofVec2f pos) {
		this->pos = pos;
		this->pType = CalcType::ABS;
		return *this;
	}

	TransformBuilder& AbsolutePosition(float x, float y) {
		this->pos = ofVec2f(x,y);
		this->pType = CalcType::ABS;
		return *this;
	}

	TransformBuilder& LocalPosition(ofVec2f pos) {
		this->pos = pos;
		this->pType = CalcType::LOC;
		return *this;
	}

	TransformBuilder& LocalPosition(float x, float y) {
		this->pos = ofVec2f(x,y);
		this->pType = CalcType::LOC;
		return *this;
	}

	TransformBuilder& RelativePosition(ofVec2f pos) {
		this->pos = pos;
		this->pType = CalcType::PER;
		return *this;
	}

	TransformBuilder& RelativePosition(float x, float y) {
		this->pos = ofVec2f(x,y);
		this->pType = CalcType::PER;
		return *this;
	}

	TransformBuilder& AbsoluteScale(ofVec2f size) {
		this->size = size;
		this->sType = CalcType::ABS;
		return *this;
	}

	TransformBuilder& LocalScale(ofVec2f size) {
		this->size = size;
		this->sType = CalcType::LOC;
		return *this;
	}

	TransformBuilder& LocalScale(float x, float y) {
		this->size = ofVec2f(x,y);
		this->sType = CalcType::LOC;
		return *this;
	}

	TransformBuilder& RelativeScale(ofVec2f size) {
		this->size = size;
		this->sType = CalcType::PER;
		return *this;
	}

	TransformBuilder& RelativeScale(float x, float y) {
		this->size = ofVec2f(x, y);;
		this->sType = CalcType::PER;
		return *this;
	}

	void Build(GameObject* element);

	/**
	 * Calculates a transformation relative to a custom parent
	 */
	void Build(GameObject* element, GameObject* parent);

	void BuildAndReset(GameObject* element);

	void Calculate(Trans& outputTrans, GameObject* element);

private:
	void SetTransform(GameObject* element, GameObject* parent);

	void CalcTransform(Trans& outputTrans, GameObject* node, GameObject* parent);

	ofVec2f CalcPosition(GameObject* node, GameObject* parent, ofVec2f pos, CalcType posCalc);

	ofVec3f CalcScale(GameObject* node, GameObject* parent, float width, float height, CalcType scaleCalc);

	/**
	* Gets center of the screen
	*/
	ofVec2f GetCenter();

	void SetDefaultVals() {
		pos = ofVec2f(0);
		zIndex = 1;
		pType = CalcType::LOC;
		anchor = ofVec2f(0,0);
		size = ofVec2f(1);
		rotationCentroid = ofVec2f(0.5f);
		sType = CalcType::LOC;
		rotation = 0;
	}
};