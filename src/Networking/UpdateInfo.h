#pragma once

#include <map>
#include "AphUtils.h"


/**
* Entity describing update informations about continuous attributes
* Is used during network synchronization
*/
class UpdateInfo {
private:
	// time the state was captured
	uint64_t time;
	// continuous values
	map<int, float> continuousValues;
	// discrete values (jumps or teleports)
	map<int, float> discreteValues;
public:

	UpdateInfo(): time(0) {

	}

	UpdateInfo(uint64_t time, map<int, float>& continuousValues, map<int, float>& discreteValues)
		: time(time), continuousValues(continuousValues), discreteValues(discreteValues) {

	}

	UpdateInfo(uint64_t time, map<int, float>& continuousValues)
		: time(time), continuousValues(continuousValues) {

	}

	UpdateInfo(uint64_t time)
		: time(time) {

	}

	/**
	* Gets time the state was captured
	*/
	uint64_t GetTime() const {
		return time;
	}

	/**
	* Sets time the state was captured
	*/
	void SetTime(uint64_t time) {
		this->time = time;
	}

	/**
	* Gets continuous values mapped by their keys
	*/
	map<int, float>& GetContinuousValues() {
		return continuousValues;
	}

	/**
	* Gets discrete values mapped by their keys
	*/
	map<int, float>& GetDiscreteValues() {
		return discreteValues;
	}

	/**
	* Gets a continuous value by key
	*/
	float GetContinuousValue(int key) {
		auto found = continuousValues.find(key);
		return (found != continuousValues.end()) ? (*found).second : 0;
	}

	/**
	* Gets a discrete value by key
	*/
	float GetDiscreteValue(int key) {
		auto found = discreteValues.find(key);
		return (found != discreteValues.end()) ? (*found).second : 0;
	}

	/**
	* Gets either continuous or discrete value by its key
	*/
	float GetVal(int key) {
		auto foundContinuous = continuousValues.find(key);

		if (foundContinuous != continuousValues.end()) return (*foundContinuous).second;

		auto foundDisc = discreteValues.find(key);
		return (foundDisc != discreteValues.end()) ? (*foundDisc).second : 0;
	}

	friend class Interpolator;
};

