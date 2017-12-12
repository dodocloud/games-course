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
#include "NetworkHost.h"
#include "AIAgentUpdateMessage.h"
#include "CompValues.h"


class AgentNetworkingSender : public Component {
public:
	AIModel* model;
	NetworkHost* host;
	int agentNetworkIdCounter = 10;

	virtual void Init() {
		RegisterSubscriber(OBJECT_ADDED);
		RegisterSubscriber(ACT_NET_CONNECTED);

		model = owner->GetRoot()->GetAttr<AIModel*>(AI_MODEL);
		this->host = owner->GetRoot()->GetComponent<NetworkHost>();
		this->host->InitHost(100, 12345);
	}

	uint64_t lastSentTime;


	void OnAgentCreated(GameObject* agent) {
		// ======================================================================================
		// TODO
		agent->SetNetworkId(agentNetworkIdCounter++);
		auto model = agent->GetAttr<AgentModel*>(ATTR_AGENTMODEL);
		auto updateMsg = new AIAgentCreationMessage(model->agentType, model->speed, agent->GetNetworkId());
		auto netMsg = updateMsg->CreateMessage();
		host->PushMessageForSending(netMsg);
		// ======================================================================================
	}


	AIAgentSnapshotMessage* CreateSnapshotMessage() {
		// send snapshot of all agents
		vector<GameObject*> allAgents;
		owner->GetScene()->FindGameObjectsByName("agent", allAgents);

		auto snapshots = new AIAgentSnapshotMessage();
		for (auto agent : allAgents) {
			int netId = agent->GetNetworkId();
			auto model = agent->GetAttr<AgentModel*>(ATTR_AGENTMODEL);

			const AIAgentSnapshot snapshot(netId, model->agentType, model->speed);
			snapshots->agents.push_back(snapshot);
		}
		return snapshots;
	}

	virtual void OnMessage(Msg& msg) {
		if (msg.GetAction() == OBJECT_ADDED && msg.GetContextNode()->GetName() == "agent") {
			// notify clients
			auto obj = msg.GetContextNode();
			OnAgentCreated(obj);
		}
		else if (msg.GetAction() == ACT_NET_CONNECTED) {

			auto peer = msg.GetData<PeerContext>();
			auto snapshots = CreateSnapshotMessage();
			auto netMsg = std::make_shared<NetOutputMessage>(NET_MSG_AGENTS_SNAPSHOT, snapshots, false, true);
			host->PushMessageForSending(netMsg, peer->id);
		}
	}

	virtual void Update(uint64_t delta, uint64_t absolute) {

		if (owner->GetContext()->IsKeyPressed(StrId((unsigned)'m')) && host->GetSendingFrequency() < 60) {
			host->SetSendingFrequency(host->GetSendingFrequency() * 1.01f);
			ofLogNotice("AIAgent", "Sending frequency set to %f", host->GetSendingFrequency());
		}

		if (owner->GetContext()->IsKeyPressed(StrId((unsigned)'n')) && host->GetSendingFrequency() > 2) {
			host->SetSendingFrequency(host->GetSendingFrequency() / 1.01f);
			ofLogNotice("AIAgent", "Sending frequency set to %f", host->GetSendingFrequency());
		}

		if (host->GetPeersNum() > 0 && CheckTime(lastSentTime, absolute, host->GetSendingFrequency())) {
			lastSentTime = absolute;

			// prepare update messages
			auto& wModel = model->GetWarehouseModel();
			vector<GameObject*> allAgents;
			owner->GetScene()->FindGameObjectsByName("agent", allAgents);

			auto update = new AIAgentUpdateMessage(wModel.currentBuildTime, wModel.petrol, wModel.ironOre, model->agentsNum, wModel.isBuilding);

			for (auto agent : allAgents) {
				int netId = agent->GetNetworkId();
				auto& trans = agent->GetTransform();
				auto dynamics = agent->GetAttr<Dynamics*>(ATTR_DYNAMICS);
				update->agentsVelocities[netId] = ofVec2f(dynamics->GetVelocity().x, dynamics->GetVelocity().y);
				update->agentsRotations[netId] = trans.rotation;
				update->agentsPositions[netId] = ofVec2f(trans.localPos.x, trans.localPos.y);
			}

			auto netMsg = std::make_shared<NetOutputMessage>(NET_MSG_AGENT_UPDATE, update, absolute, true, false);
			host->PushMessageForSending(netMsg);
		}
	}
};