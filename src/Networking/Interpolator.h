#pragma once

#include "Component.h"
#include "UpdateInfo.h"
#include "AphMain.h"


/**
* Class that interpolates continuous values received from network
*/
class Interpolator {
private:
	// number of received messages
	int messagesReceived = 0;
	// initialization time
	uint64_t initTime = 0;
	// previous message
	spt<UpdateInfo> previous = nullptr;
	// current received message used for interpolation
	spt<UpdateInfo> current = nullptr;
	// the newest received message
	spt<UpdateInfo> next = nullptr;
	// speed of updates, set automatically according to the situation
	float updateSpeed = 1;
	// number of seconds after which updates are discarded and reinitialized
	int updateDelayThreshold = 10000;
	// number of frames that will be extrapolated 
	int extrapolatedSamples = 2;

public:

	Interpolator() {
		Reset();
	}

	void Reset();


	/**
	* Gets initialization time
	*/
	uint64_t GetInitTime() const {
		return initTime;
	}

	/**
	* Gets current received message used for interpolation
	*/
	spt<UpdateInfo> GetCurrentUpdate() const {
		return current;
	}

	/**
	* Gets current speed of updates
	*/
	float GetUpdateSpeed() const {
		return updateSpeed;
	}

	/**
	* Gets number of seconds after which updates are discarded and reinitialized
	*/
	int GetUpdateDelayThreshold() const {
		return updateDelayThreshold;
	}

	/**
	* Sets number of seconds after which updates are discarded and reinitialized
	*/
	void SetUpdateDelayThreshold(int threshold) {
		this->updateDelayThreshold = threshold;
	}


	/**
	* Accepts an update message
	*/
	void AcceptUpdateMessage(spt<UpdateInfo> msg);

	/**
	 * Updates all variables according to the delta time
	 */
	void Update(const uint64_t delta);
};
