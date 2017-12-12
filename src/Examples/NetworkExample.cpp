
#include "NetworkExample.h"
#include "AphUtils.h"
#include "ofLog.h"
#include "ScriptManager.h"
#include "CollisionManager.h"
#include "NetworkClient.h"
#include "UpdateInfo.h"
#include "Interpolator.h"
#include "UpdateMessage.h"
#include "NetworkHost.h"


StrId NET_MSG_COMMAND("NET_MSG_COMMAND");
StrId NET_MSG_UPDATE("NET_MSG_UPDATE");

void NetworkBehavior::ProcessMessageFromHost(NetInputMessage* netMsg) {
	auto updateMsg = netMsg->GetData<NetworkExampleMessage>();
	auto deltaInfo = std::make_shared<UpdateInfo>(netMsg->GetMsgTime());
	deltaInfo->GetContinuousValues()[KEY_POSITION_X] = updateMsg->positionX;
	deltaInfo->GetContinuousValues()[KEY_POSITION_Y] = updateMsg->positionY;
	deltaInfo->GetContinuousValues()[KEY_ROTATION] = updateMsg->rotation;
	interpolator->AcceptUpdateMessage(deltaInfo);
}

void NetworkBehavior::UpdateInterpolatedValues() {
	// set position and rotation according to the message
	auto delta = this->interpolator->GetCurrentUpdate();
	if (delta) {
		owner->GetTransform().rotation = delta->GetVal(KEY_ROTATION);
		owner->GetTransform().localPos.x = delta->GetVal(KEY_POSITION_X);
		owner->GetTransform().localPos.y = delta->GetVal(KEY_POSITION_Y);
	}
}

NetworkExampleMessage* NetworkBehavior::CreateMessageForClient() {
	// send values to the client
	auto updateInfo = new NetworkExampleMessage();
	updateInfo->rotation = owner->GetTransform().rotation;
	updateInfo->positionX = owner->GetTransform().localPos.x;
	updateInfo->positionY = owner->GetTransform().localPos.y;
	return updateInfo;
}



void NetworkBehavior::OnMessage(Msg& msg) {
	if (msg.HasAction(ACT_NET_MESSAGE_RECEIVED)) {
		if (netType == NetworkType::CLIENT) {
			// push received message to Interpolator
			auto netMsg = msg.GetData<NetInputMessage>();
			if (netMsg->GetAction() == NET_MSG_UPDATE) {
				this->ProcessMessageFromHost(netMsg);
			}
		}
		else {
			auto netMsg = msg.GetData<NetInputMessage>();
			if (netMsg->GetAction() == NET_MSG_COMMAND) {
				cout << "Received RESET command" << endl;
				owner->GetTransform().rotation = 0;
			}
		}
	}
}

void NetworkBehavior::Update(const uint64_t delta, const uint64_t absolute) {

	interpolator->Update(delta);

	if (netType == NetworkType::NONE) {
		if (owner->GetContext()->IsKeyPressed(StrId((unsigned)('s')))) {
			netType = NetworkType::SERVER;
			this->InitNetwork(netType);
		}
		if (owner->GetContext()->IsKeyPressed(StrId((unsigned)('c')))) {
			netType = NetworkType::CLIENT;
			this->InitNetwork(netType);
		}
	}
	else if (netType == NetworkType::CLIENT) {
		if (owner->GetContext()->IsKeyPressed(StrId((unsigned)('r')))) {
			cout << "Sending RESET command" << endl;
			spt<NetOutputMessage> netMsg = spt<NetOutputMessage>(new NetOutputMessage());
			netMsg->SetAction(StrId(NET_MSG_COMMAND));
			client->PushMessageForSending(netMsg);
		}

		// set position and rotation according to the message
		this->UpdateInterpolatedValues();
	}
	else if (netType == NetworkType::SERVER) {
		if (CheckTime(lastSendTime, absolute, frequency)) {
			lastSendTime = absolute;
			auto updateInfo = CreateMessageForClient();
			auto netMsg = std::make_shared<NetOutputMessage>();
			netMsg->SetData(updateInfo);
			netMsg->SetAction(NET_MSG_UPDATE);
			netMsg->SetIsUpdateSample(true);

			auto context = owner->GetContext();
			if (!context->IsKeyPressed(StrId((unsigned)('r')))) {
				// sending is stopped
				netMsg->SetMsgTime(absolute);
				host->PushMessageForSending(netMsg);
			}

			if (context->IsKeyPressed(StrId((unsigned)('m'))) && frequency < 20) {
				frequency++;
				cout << "Frequency changed to" << frequency << endl;
			}
			if (context->IsKeyPressed(StrId((unsigned)('n'))) && frequency > 2) {
				frequency--;
				cout << "Frequency changed to" << frequency << endl;
			}
		}
	}
}

//--------------------------------------------------------------
void NetworkExample::Init() {

	// load sprite atlas
	auto spritesImage = this->GetImage("Examples/networking.png");
	renderer->AddTileLayer(spritesImage, "spriteLayer", 5000, 1);

	// set scale factor so that the whole scene will have height of 25 units
	float desiredSceneHeight = 25.0f;
	float autoScale = ofGetWindowSize().y / desiredSceneHeight;
	this->meshDefaultScale = 1.0f / autoScale * (ofGetWindowSize().y / 400.0f);
	rootBorder = new FRect(ofGetWindowSize().x / autoScale, ofGetWindowSize().y / autoScale, ofColor(0));
	rootBorder->SetIsRenderable(false);
}

void NetworkExample::Reset() {
	if (scene->GetRootObject() != nullptr) {
		delete scene->GetRootObject();
	}

	auto rootObject = new GameObject("root", this, scene, rootBorder);
	scene->SetRootObject(rootObject);;

	rootObject->AddComponent(new NetworkClient());
	rootObject->AddComponent(new NetworkHost());

	auto spritesImage = this->GetImage("Examples/networking.png");
	auto spriteSheet = new SpriteSheet(spritesImage, "sprites", 1, 106, 97);

	// add sprite
	auto dragon = Sprite(spriteSheet, 0);
	dragon.GetTransform().scale = ofVec3f(GetMeshDefaultScale());

	auto dragonObj = new GameObject("ship", this, scene, new SpriteMesh(dragon, "spriteLayer"));
	dragonObj->AddComponent(new RotationAnim());
	rootObject->AddChild(dragonObj);
	dragonObj->AddComponent(new NetworkBehavior());

	TransformBuilder trBld;
	trBld.RelativePosition(0.5f, 0.5f).Anchor(0.5f, 0.5f).LocalScale(ofVec2f(GetMeshDefaultScale())).BuildAndReset(dragonObj);
}

int NetworkExample::GetMappedKey(StrId action) {
	return action.GetValue();
}