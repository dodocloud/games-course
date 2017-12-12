
#include "Interpolator.h"
#include "NetMessage.h"
#include "UpdateMessage.h"


void Interpolator::Reset() {
	messagesReceived = 0;
	initTime = 0;
	updateSpeed = 1;
	previous = spt<UpdateInfo>();
	next = spt<UpdateInfo>();
	updateSpeed = 1;
	current = std::make_shared<UpdateInfo>();
}


void Interpolator::AcceptUpdateMessage(spt<UpdateInfo> msg) {
	if (!previous) {
		// set the first received message
		initTime = msg->time;
		messagesReceived = 1;
		previous = msg;
		current->time = msg->GetTime();
	}
	else if (!next) {
		// set the second received message
		next = msg;
		messagesReceived++;
	}
	else {
		// third and so on...
		previous = next;
		next = msg;
		messagesReceived++;
	}
}

void Interpolator::Update(const uint64_t delta) {
	if (previous && next) {

		if (abs(static_cast<int>(static_cast<int>(current->time) - this->next->time)) > updateDelayThreshold) {
			// disconnected for a long time
			this->current->time = this->next->time;
			messagesReceived = 1;
			initTime = next->time;
		}

		current->time += (int)(delta*updateSpeed);

		// calculate average interval between frames
		const float averageFrameDiff = ((int)(next->time - initTime)) / ((float)messagesReceived);

		if ((current->time < this->next->time) || ((current->time - this->next->time) < averageFrameDiff * extrapolatedSamples)) {
			
			if (this->current->time < this->previous->time) {
				// we are behind the current state -> accelerate speed little bit
				if (updateSpeed < 2.5f) updateSpeed *= 1.1f;

			}
			else if (this->current->time > this->next->time) {
				// we have overcame the current state -> deccelerate speed little bit
				if (updateSpeed > 1.0f) updateSpeed /= 1.1f;

			}
			else {
				// converge to 1
				if (updateSpeed > 1) updateSpeed /= 1.2f;
				else if (updateSpeed < 1) updateSpeed *= 1.2f;
				else updateSpeed = 1;
			}

			const int diffTotal = (int)(this->next->time - this->previous->time);
			const int diffActual = (int)(this->current->time - this->previous->time);

			// calculate percentage position between previous and next frame
			float ratio = diffActual / ((float)diffTotal);

			// calculate current values based on linear interpolation
			for (auto& dt : next->continuousValues) {
				auto prevIt = previous->continuousValues.find(dt.first);

				float nextVal = dt.second;
				float prevVal = prevIt != previous->continuousValues.end() ? (*prevIt).second : nextVal;
				float currentVal = prevVal + (nextVal - prevVal)*ratio;
				
				// set the current interpolated value
				current->continuousValues[dt.first] = currentVal;
			}
		}
	}
}