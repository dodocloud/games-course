#pragma once

#include <map>
#include "NetMessage.h"
#include "UpdateInfo.h"

using namespace std;


class NetReader;
class NetWriter;

/**
* A network message consisting of hashed attributes
*/
class UpdateMessage : public NetData {
private:
	// continuous attributes
	map<int, float> continuousValues;
	// discrete attributes
	map<int, float> discreteValues;
public:


	UpdateMessage() {

	}

	UpdateMessage(spt<UpdateInfo> info) {
		this->continuousValues = info->GetContinuousValues();
		this->discreteValues = info->GetDiscreteValues();
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

	void LoadFromStream(NetReader* reader) override;

	void SaveToStream(NetWriter* writer) override;

	int GetDataLength() override {
		return (continuousValues.size() + discreteValues.size()) * 8 + 4 + 4;
	}
};
