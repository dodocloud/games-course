#pragma once

#include "AphMain.h"
#include "Renderable.h"
#include "GameObject.h"
#include "AphApp.h"
#include "jsonxx.h"
#include "NetworkClient.h"
#include "NetworkHost.h"
#include "Interpolator.h"
#include "UpdateMessage.h"

class RotationAnim : public Component {
	virtual void Update(uint64_t delta, uint64_t absolute) {
		owner->GetTransform().rotation += 0.01f * delta;
	}
};

enum class NetworkType { NONE, CLIENT, SERVER };
extern StrId NET_MSG_COMMAND;
extern StrId NET_MSG_UPDATE;



class NetworkExampleMessage : public NetData {
public:
	float positionX;
	float positionY;
	float rotation;

	void LoadFromStream(NetReader* reader) {
		positionX = reader->ReadDWord();
		positionY = reader->ReadDWord();
		rotation = reader->ReadDWord();
	}

	void SaveToStream(NetWriter* writer) {
		writer->WriteDWord(positionX);
		writer->WriteDWord(positionY);
		writer->WriteDWord(rotation);
	}

	int GetDataLength() {
		return 4 + 4 + 4;
	}
};



class NetworkBehavior : public Component {
private:
	NetworkClient* client;
	NetworkHost* host;
	Interpolator* interpolator = new Interpolator();
	NetworkType netType = NetworkType::NONE;

	int frequency = 10;
	uint64_t lastSendTime = 0;

#define KEY_POSITION_X 0
#define KEY_POSITION_Y 1
#define KEY_ROTATION 2

public:
	NetworkBehavior() {

	}

	void Init() {
		RegisterSubscriber(ACT_NET_MESSAGE_RECEIVED);
		this->client = owner->GetRoot()->GetComponent<NetworkClient>();
		this->host = owner->GetRoot()->GetComponent<NetworkHost>();
	}

	void InitNetwork(NetworkType netType) {
		this->netType = netType;

		if (netType == NetworkType::CLIENT) {
			client->InitClient(1234, ofRandom(11000, 20000), 11987);
			client->SetAutoConnect(true);
			// remove animator, because animation will be synchronized
			owner->RemoveComponent(owner->GetComponent<RotationAnim>());
			owner->RemoveComponent(owner->GetComponent<NetworkHost>());
		}

		if (netType == NetworkType::SERVER) {
			host->InitHost(1234, 11987);
			owner->RemoveComponent(owner->GetComponent<NetworkClient>());
		}
	}

	void ProcessMessageFromHost(NetInputMessage* netMsg);
	void UpdateInterpolatedValues();
	NetworkExampleMessage* CreateMessageForClient();
	void OnMessage(Msg& msg);


	virtual void Update(const uint64_t delta, const uint64_t absolute);
};



class NetworkExample : public AphApp {
public:
	// border of the root element
	FRect* rootBorder;

	/**
	 * Initializes the game
	 */
	void Init();

	/**
	 * Resets the game
	 */
	void Reset();

	/**
	 * Gets key that is mapped onto a given action
	 */
	virtual int GetMappedKey(StrId action);
};