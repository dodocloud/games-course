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
		// ======================================================================================
	}

	void UpdateInterpolatedValues() {
		// ======================================================================================
		// TODO
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
