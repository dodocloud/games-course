#pragma once

#include "SteeringComponent.h"
#include "StrId.h"
#include "Component.h"
#include "SteeringMath.h"
#include "AphMain.h"
#include "GameObject.h"
#include "AIAgentsApp.h"
#include "AIModel.h"
#include "SteeringComponent.h"
#include "AIConstants.h"
#include "AIAgentsFactory.h"
#include "NetMessage.h"
#include "NetReader.h"
#include "NetWriter.h"

struct AIAgentSnapshot {
	int netId;
	int type;
	int speed;

	AIAgentSnapshot(){}

	AIAgentSnapshot(int netId, int type, int speed) : netId(netId), type(type), speed(speed){}
};

class AIAgentSnapshotMessage : public NetData {
public:
	vector<AIAgentSnapshot> agents;

	void LoadFromStream(NetReader* reader) {
		int agentsNum = reader->ReadDWord();

		for(int i=0; i<agentsNum; i++) {
			AIAgentSnapshot snapshot;
			snapshot.netId = reader->ReadDWord();
			snapshot.speed = reader->ReadDWord();
			snapshot.type = reader->ReadDWord();
			agents.push_back(snapshot);
		}
	}

	void SaveToStream(NetWriter* writer) {
		writer->WriteDWord(agents.size());
		
		for(auto& agent : agents) {
			writer->WriteDWord(agent.netId);
			writer->WriteDWord(agent.speed);
			writer->WriteDWord(agent.type);
		}
	}

	int GetDataLength() {
		return agents.size() * 4 * 3 + 4;
	}
};

class AIAgentCreationMessage : public NetData {
public:
	int agentType;
	int speed;
	int networkId;

	AIAgentCreationMessage(){}

	AIAgentCreationMessage(int agentType, int speed, int networkId) : agentType(agentType), speed(speed), networkId(networkId){}

	void LoadFromStream(NetReader* reader) {
		this->networkId = reader->ReadDWord();
		this->speed = reader->ReadDWord();
		this->agentType = reader->ReadDWord();
	}

	void SaveToStream(NetWriter* writer) {
		writer->WriteDWord(this->networkId);
		writer->WriteDWord(this->speed);
		writer->WriteDWord(this->agentType);
	}

	int GetDataLength() {
		return 4 * 3;
	}

	spt<NetOutputMessage> CreateMessage() {
		return std::make_shared<NetOutputMessage>(NET_MSG_AGENT_CREATED, this, false, true);
	}
};


class AIAgentUpdateMessage : public NetData {
public:
	// building time of current agent
	unsigned currentBuildTime = 0;
	int petrol;
	int ironOre;
	int agentsNum;
	bool isBuilding;

	map<int, ofVec2f> agentsVelocities;
	map<int, ofVec2f> agentsPositions;
	map<int, float> agentsRotations;

	AIAgentUpdateMessage() {

	}

	AIAgentUpdateMessage(unsigned currentBuildTime, int petrol, int ironOre, int agentsNum, bool isBuilding)
		:currentBuildTime(currentBuildTime), petrol(petrol), ironOre(ironOre), agentsNum(agentsNum), isBuilding(isBuilding)
	{
		
	}

	void LoadFromStream(NetReader* reader) {
		this->isBuilding = reader->ReadBit();
		this->agentsNum = reader->ReadDWord();

		for (int i = 0; i<agentsNum; i++) {
			int netId = reader->ReadDWord();
			float velX = reader->ReadFloat();
			float velY = reader->ReadFloat();
			float posX = reader->ReadFloat();
			float posY = reader->ReadFloat();
			float rot = reader->ReadFloat();
			agentsVelocities[netId] = ofVec2f(velX, velY);
			agentsPositions[netId] = ofVec2f(posX, posY);
			agentsRotations[netId] = rot;
		}

		ironOre = reader->ReadDWord();
		petrol = reader->ReadDWord();
		currentBuildTime = reader->ReadDWord();
	}

	void SaveToStream(NetWriter* writer) {
		writer->WriteBit(isBuilding);
		writer->WriteDWord(agentsNum);

		set<int> agentsNetworkIds;

		for (auto pair : agentsVelocities) {
			agentsNetworkIds.insert(pair.first);
		}

		for (auto netId : agentsNetworkIds) {
			auto vel = agentsVelocities[netId];
			auto pos = agentsPositions[netId];
			auto rot = agentsRotations[netId];

			writer->WriteDWord(netId);
			writer->WriteFloat(vel.x);
			writer->WriteFloat(vel.y);
			writer->WriteFloat(pos.x);
			writer->WriteFloat(pos.y);
			writer->WriteFloat(rot);
		}

		writer->WriteDWord(ironOre);
		writer->WriteDWord(petrol);
		writer->WriteDWord(currentBuildTime);
	}

	int GetDataLength() {
		return 4 + 4 + 4 + 4 + 1 + agentsNum * 4 * 6; // posX, posY, velX, velY, rotation, networkId -> 6 * 4B
	}
};
