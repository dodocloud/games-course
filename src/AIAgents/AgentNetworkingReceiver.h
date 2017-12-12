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
#include "NetworkClient.h"
#include "AIAgentUpdateMessage.h"
#include "UpdateInfo.h"
#include "Interpolator.h"

class AgentNetworkingReceiver : public Component {
public:
	AIModel* model;
	NetworkClient* client;

	virtual void Init() {
		model = owner->GetRoot()->GetAttr<AIModel*>(AI_MODEL);
		this->client = owner->GetRoot()->GetComponent<NetworkClient>();
		RegisterSubscriber(ACT_NET_MESSAGE_RECEIVED);
		this->client->InitClient(100, 11134, 12345, "127.0.0.1");
		this->client->SetAutoConnect(true);
	}

	Interpolator* inp = new Interpolator();

	void ProcessUpdateMessage(NetInputMessage* netMsg) {
		auto data = netMsg->GetData<AIAgentUpdateMessage>();
		// ======================================================================================
		// TODO
		auto& wModel = model->GetWarehouseModel();
		wModel.petrol = data->petrol;
		wModel.ironOre = data->ironOre;
		wModel.currentBuildTime = data->currentBuildTime;
		wModel.isBuilding = data->isBuilding;
		model->agentsNum = data->agentsNum;

		auto updateInfo = spt<UpdateInfo>(new UpdateInfo());

		for (auto pair : data->agentsPositions) {
			int netId = pair.first;
			auto agent = owner->GetScene()->FindGameObjectByNetworkId(netId);

			if (agent != nullptr) {
				auto& transform = agent->GetTransform();
				auto dynamics = agent->GetAttr<Dynamics*>(ATTR_DYNAMICS);
				auto agentPos = data->agentsPositions[netId];
				auto agentVel = data->agentsVelocities[netId];
				auto agentRot = data->agentsRotations[netId];

				//dynamics->SetVelocity(ofVec2f(agentVel.x, agentVel.y));

				updateInfo->GetContinuousValues()[netId * 1000 + 1] = agentPos.x;
				updateInfo->GetContinuousValues()[netId * 1000 + 2] = agentPos.y;
				updateInfo->GetContinuousValues()[netId * 1000 + 3] = agentRot;

				if (!interpolationEnabled) {
					transform.localPos.x = agentPos.x;
					transform.localPos.y = agentPos.y;
					transform.rotation = agentRot;
				}
			}
		}

		updateInfo->SetTime(netMsg->GetMsgTime());
		inp->AcceptUpdateMessage(updateInfo);
		// ======================================================================================
	}

	void UpdateInterpolatedValues() {
		// ======================================================================================
		// TODO
		auto actualUpdate = inp->GetCurrentUpdate();
		if (actualUpdate) {
			vector<GameObject*> allAgents;
			owner->GetScene()->FindGameObjectsByName("agent", allAgents);

			for (auto agent : allAgents) {
				int netId = agent->GetNetworkId();
				auto& transform = agent->GetTransform();
				transform.localPos.x = actualUpdate->GetContinuousValues()[netId * 1000 + 1];
				transform.localPos.y = actualUpdate->GetContinuousValues()[netId * 1000 + 2];
				transform.rotation = actualUpdate->GetContinuousValues()[netId * 1000 + 3];
			}
		}
		// ======================================================================================
	}

	void OnMessage(Msg& msg) {
		if (msg.HasAction(ACT_NET_MESSAGE_RECEIVED)) {
			auto netMsg = msg.GetData<NetInputMessage>();

			if (netMsg->GetAction() == NET_MSG_AGENT_UPDATE) {
				this->ProcessUpdateMessage(netMsg);
			}
			else if (netMsg->GetAction() == NET_MSG_AGENT_CREATED) {
				auto data = netMsg->GetData<AIAgentCreationMessage>();
				AIAgentsFactory::CreateAgentFromNetwork(owner, model, data->agentType, data->speed, data->networkId);
			}
			else if (netMsg->GetAction() == NET_MSG_AGENTS_SNAPSHOT) {
				auto data = netMsg->GetData<AIAgentSnapshotMessage>();

				for (auto& snapshot : data->agents) {
					auto existing = owner->GetScene()->FindGameObjectByNetworkId(snapshot.netId);

					if (existing == nullptr) {
						AIAgentsFactory::CreateAgentFromNetwork(owner, model, snapshot.type, snapshot.speed, snapshot.netId);
					}
				}
			}
		}
	}

	bool interpolationEnabled = true;

	virtual void Update(uint64_t delta, uint64_t absolute) {

		if (owner->GetContext()->IsKeyPressed(StrId((unsigned)'a')) && !interpolationEnabled) {
			ofLogNotice("AIAgent", "Interpolation enabled");
			interpolationEnabled = true;
		}

		if (owner->GetContext()->IsKeyPressed(StrId((unsigned)'s')) && interpolationEnabled) {
			ofLogNotice("AIAgent", "Interpolation disabled");
			interpolationEnabled = false;
		}

		inp->Update(delta);

		if (interpolationEnabled) {
			this->UpdateInterpolatedValues();
		}
	}
};
