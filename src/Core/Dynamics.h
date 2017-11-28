#pragma once

#include "StrId.h"
#include "ofVec2f.h"
#include "Attribute.h"

/**
* Container for physical forces
*/
class Dynamics  {
private:
	// map of forces acting on the object
	map<StrId, ofVec2f>* forces = nullptr;
	ofVec2f acceleration = ofVec2f(0);
	ofVec2f velocity = ofVec2f(0);
	float angularSpeed = 0;
public:

	~Dynamics() {
		delete forces;
	}

	/**
	* Gets the acceleration vector
	* Note: if more forces used, the acceleration vector is usually
	* calculated, using the CalcForce method
	*/
	ofVec2f& GetAcceleration() {
		return acceleration;
	}

	/**
	* Sets the acceleration vector
	* Note: if you want to calculate with more than one force, use
	* AddForce method instead
	*/
	void SetAcceleration(ofVec2f acceleration) {
		this->acceleration = acceleration;
	}

	/**
	* Sets the force according to its key
	* @param key key of the force
	* @param force force to set
	*/
	void SetForce(StrId key, ofVec2f force) {
		if (forces == nullptr) forces = new map<StrId, ofVec2f>();

		(*forces)[key] = force;
	}

	/**
	* Calculates the resulting force according to all forces stored
	* If no force is set, returns acceleration
	*/
	ofVec2f CalcForce() const {
		if (forces == nullptr) return acceleration;

		ofVec2f result = ofVec2f(0);

		for (auto& key : *forces) {
			result += key.second;
		}

		return result;
	}

	/**
	* Gets velocity vector
	*/
	ofVec2f& GetVelocity(){
		return velocity;
	}

	/**
	* Sets velocity vector
	*/
	void SetVelocity(ofVec2f velocity) {
		this->velocity = velocity;
	}

	/**
	* Gets angular speed
	*/
	float GetAngularSpeed() const {
		return angularSpeed;
	}

	/**
	* Sets angular speed
	*/
	void SetAngularSpeed(float angularSpeed) {
		this->angularSpeed = angularSpeed;
	}

	/**
	* Stops the movement by setting all vectors to zero
	*/
	void Stop() {
		if (forces != nullptr) {
			forces->clear();
		}
		this->velocity = ofVec2f(0);
		this->acceleration = ofVec2f(0);
		this->angularSpeed = 0;
	}

	void UpdateVelocity(uint64_t delta, float gameSpeed) {
		auto force = CalcForce();
		velocity += force * delta * gameSpeed;
	}

	ofVec2f CalcDelta(uint64_t delta, float gameSpeed) const {
		return velocity * delta * gameSpeed;
	}
};