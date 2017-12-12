
#include "NetworkClient.h"
#include "NetworkManager.h"
#include "NetMessage.h"
#include "ofxNetworkUtils.h"

StrId ACT_NET_CONNECTED("ACT_NET_CONNECTED");
StrId ACT_NET_MESSAGE_RECEIVED("ACT_NET_MESSAGE_RECEIVED");
StrId ACT_NET_DISCONNECTED("ACT_NET_DISCONNECTED");
StrId ACT_NET_CONNECTION_LOST("ACT_NET_CONNECTION_LOST");

void NetworkClient::InitClient(ABYTE applicationId, int clientPort, int hostPort, string hostIp) {

	Close();

	this->applicationId = applicationId;
	this->hostIp = hostIp;
	this->hostPort = hostPort;
	this->clientPort = clientPort;
	this->clientId = 0;
	this->forConfirmationMessageIds.clear();
	this->forConfirmationMessageTimes.clear();

	ofLogNotice("Network", "Initialized client for application %d on client port %d and host port %d", applicationId, clientPort, hostPort);
	network = new NetworkManager();
	network->SetupUDPReceiver(clientPort, 10000, true);
	network->GetUDPSender().SetEnableBroadcast(true);
	networkState = ClientState::DISCOVERING;
}

void NetworkClient::PushMessageForSending(spt<NetOutputMessage> msg) {

	if (msg->IsUpdateSample() && msg->GetMsgTime() == 0) {
		throw runtime_error("Update messages must have time configured");
	}

	// only when the communicator is in COMMUNICATING state there
	// could be sent more than one message at a time
	if (this->networkState != ClientState::COMMUNICATING) {
		messagesToSend.clear();
	}

	messagesToSend.push_back(msg);
}

void NetworkClient::Close() {
	ofLogNotice("Network", "Closing client");

	if (network != nullptr) {
		if (networkState == ClientState::COMMUNICATING) {
			const auto msg = std::make_shared<NetOutputMessage>(0, this->clientId, NetMsgType::DISCONNECT);
			network->SendUDPMessage(applicationId, msg);
		}

		network->CloseUDP();
		delete network;
		network = nullptr;
	}

	lastReceivedMsgId = -1;
	lastSentMsgId = 0;
	messagesToSend.clear();
	lastReceivedMsgTime = 0;
}


void NetworkClient::ConnectToHost(string ip, int port) {
	ofLogNotice("Network", "Connecting to host %s on port %d", ip.c_str(), port);
	this->hostIp = ip;
	this->hostPort = port;

	network->SetupUDPSender(hostIp, hostPort, true);
	network->GetUDPSender().SetEnableBroadcast(false);
	networkState = ClientState::CONNECTING;
}


void NetworkClient::Update(uint64_t delta, uint64_t absolute) {
	if (network != nullptr) {
		switch (networkState) {
		case ClientState::DISCOVERING:
			UpdateDiscovering(absolute);
			break;
		case ClientState::CONNECTING:
			UpdateConnecting(absolute);
			break;
		case ClientState::COMMUNICATING:
			UpdateCommunicating(absolute);
			break;
		}
	}
}


void NetworkClient::UpdateDiscovering(uint64_t absolute) {
	// check if it is time to broadcast
	if (CheckTime(lastBroadcastTime, absolute, broadcastingFrequency)) {
		lastBroadcastTime = absolute;

		const auto msg = std::make_shared<NetOutputMessage>(lastReceivedMsgId, 0, NetMsgType::DISCOVER_REQUEST);

		// send broadcast messsages to subnets 192.168, 10.16 and localhost
		ofLogNotice("Network", "Broadcasting");
		if (this->hostIp == "") {
			network->SetupUDPSender("192.168.0.255", hostPort, true);
			network->SendUDPMessage(applicationId, msg);
			network->SetupUDPSender("10.16.0.255", hostPort, true);
			network->SendUDPMessage(applicationId, msg);
			network->SetupUDPSender("127.0.0.1", hostPort, true);
			network->SendUDPMessage(applicationId, msg);
		}
		else {
			network->SetupUDPSender(hostIp, hostPort, true);
			network->SendUDPMessage(applicationId, msg);
		}
		// check for discover responses
		auto message = network->ReceiveUDPMessage(applicationId, 0, true);
		if (message && (message->GetMsgType() == NetMsgType::DISCOVER_RESPONSE)) {

			ofLogNotice("Network", "Found host %s", message->GetSourceIp().c_str());

			// notify other components
			SendMsg(ACT_NET_MESSAGE_RECEIVED, message.get());

			// update list of discovered servers
			discoveredHosts.insert(message->GetSourceIp());
			lastReceivedMsgTime = absolute;

			// connect to host automatically
			if (autoConnect) ConnectToHost(message->GetSourceIp(), message->GetSourcePort());
		}
	}
}


void NetworkClient::UpdateConnecting(uint64_t absolute) {

	if (CheckTime(lastConnectingTime, absolute, connectingFrequency)) {
		lastConnectingTime = absolute;
		// send connection request. Client Id is 0 when not assigned yet, however in case of reconnect, the id is already set
		const auto msg = std::make_shared<NetOutputMessage>(0, this->clientId, NetMsgType::CONNECT_REQUEST);
		network->SendUDPMessage(applicationId, msg);
	}

	if (lastReceivedMsgTime == 0) lastReceivedMsgTime = absolute;

	// check connection response
	auto message = network->ReceiveUDPMessage(applicationId, 0, false);

	const int err = ofxNetworkCheckError();
	if (err == OFXNETWORK_ERROR(CONNRESET)) {
		ofLogNotice("Network", "Closing port...");
		InitClient(applicationId, this->clientPort, this->hostPort, this->hostIp);
	}

	if (message && message->GetMsgType() == NetMsgType::CONNECT_RESPONSE) {
		lastReceivedMsgTime = absolute;
		networkState = ClientState::COMMUNICATING;
		this->clientId = message->GetPeerId();
		ofLogNotice("Network", "Connected to host %s; assigned client ID: %d", message->GetSourceIp().c_str(), this->clientId);

		// notify other components
		SendMsg(ACT_NET_CONNECTED, message.get());
	}
	else if ((absolute - lastReceivedMsgTime) > disconnectTimeout * 1000) {
		ofLogNotice("Network", "No message received from host for %d s, disconnecting...", disconnectTimeout);
		SendMsg(ACT_NET_DISCONNECTED);
		InitClient(applicationId, this->clientPort, this->hostPort, this->hostIp);
	}
}

void NetworkClient::UpdateCommunicating(uint64_t absolute) {

	// process until there are no received messages 
	while (true) {
		const auto message = network->ReceiveUDPMessage(applicationId, 0, false);

		const int err = ofxNetworkCheckError();
		if (err == OFXNETWORK_ERROR(CONNRESET)) {
			ofLogNotice("Network", "Closing port...");
			InitClient(applicationId, this->clientPort, this->hostPort);
		}

		if (!message) break;

		const auto type = message->GetMsgType();
		if (type == NetMsgType::UPDATE) {
			lastReceivedMsgTime = absolute;
			ProcessUpdateMessage(message);
		}
	}

	if (CheckTime(lastSendingTime, absolute, sendingFrequency)) {
		// send all messages
		SendMessages(absolute);
	}

	if (((absolute - lastReceivedMsgTime) > reconnectTimeout * 1000)) {
		ofLogNotice("Network", "No message received from host for %d s, reconnecting...", reconnectTimeout);
		networkState = ClientState::CONNECTING;
		SendMsg(ACT_NET_CONNECTION_LOST);
	}
}

void NetworkClient::SendMessages(uint64_t time) {

	if (!messagesToSend.empty()) {

		for (auto& msg : messagesToSend) {
			lastSentMsgId++;
			if (lastSentMsgId == 0) lastSentMsgId++; // zero is for for undefined sync messages

			msg->SetSyncId(lastSentMsgId);
			msg->SetPeerId(this->clientId);

			if (!forConfirmationMessageIds.empty()) {
				// if there is at least one id that hasn't been confirmed
				// yet, send it with the message
				const auto lastItem = prev(forConfirmationMessageIds.end());
				msg->SetConfirmationId(*lastItem);
				forConfirmationMessageIds.erase(lastItem);
			}

			msg->SetMsgType(NetMsgType::UPDATE);

			network->SendUDPMessage(applicationId, msg);
		}

		this->lastSendingTime = time;
		messagesToSend.clear();
	}
	else if (!forConfirmationMessageIds.empty()) {
		// send the rest confirmation messages separately
		for (auto& acc : forConfirmationMessageIds) {
			auto msg = std::make_shared<NetOutputMessage>(1, this->clientId, NetMsgType::ACCEPT);
			msg->SetMsgTime(time);
			msg->SetConfirmationId(acc);
			network->SendUDPMessage(applicationId, msg);
		}

		forConfirmationMessageIds.clear();
	}
	else if (CheckTime(lastSendingTime, time, beepFrequency)) {
		// if there is nothing to send, we have to send a beep message in order to have the server know we're still here
		lastSendingTime = time;
		auto msg = std::make_shared<NetOutputMessage>(1, this->clientId, NetMsgType::BEEP);
		msg->SetMsgTime(time);
		network->SendUDPMessage(applicationId, msg);
	}
}

void NetworkClient::ProcessUpdateMessage(spt<NetInputMessage> message) {

	if (message->IsReliable() && forConfirmationMessageIds.count(message->GetSyncId()) == 0) {
		// got a reliable message that must be confirmed -> update collection of messages for acceptation
		ofLogNotice("Network", "Received reliable message %d ", (int)message->GetSyncId());
		forConfirmationMessageIds.insert(message->GetSyncId());
	}

	if (forConfirmationMessageTimes.count(message->GetMsgTime()) == 0) {

		if (message->GetSyncId() > this->lastReceivedMsgId || (this->lastReceivedMsgId - message->GetSyncId()) > 128
			|| (!message->IsUpdateSample())) {
			// old messages can be still processed but not update messages, because old updates are not important anymore

			// synchronization ids may be in range 0-255 so if the difference is greater than 128 it means that
			// the numbering goes from zero again
			if (message->GetSyncId() > this->lastReceivedMsgId || this->lastReceivedMsgId - message->GetSyncId() > 128)
				lastReceivedMsgId = message->GetSyncId();

			SendMsg(ACT_NET_MESSAGE_RECEIVED, message.get());
		}

		if (message->IsReliable()) {
			forConfirmationMessageTimes.insert(message->GetMsgTime());

			if (forConfirmationMessageTimes.size() > 128) {
				// if there is more than 128 messages in the buffer, remove half of the buffer, 
				//because it shouldn't be important anymore

				for (auto it = forConfirmationMessageTimes.begin(); it != forConfirmationMessageTimes.end(); ) {
					if (forConfirmationMessageTimes.size() < 64) break;
					if (*it % 2 == 0) {
						forConfirmationMessageTimes.erase(it++);
					}
					else {
						++it;
					}
				}
			}
		}
	}
}
