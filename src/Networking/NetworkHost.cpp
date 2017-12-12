
#include "NetworkHost.h"
#include "NetworkManager.h"
#include "NetMessage.h"
#include "ofxNetworkUtils.h"

int NetworkHost::peerCounter = 1; // first ID must be 1

void NetworkHost::InitHost(ABYTE applicationId, int port) {
	if (this->network != nullptr) {
		throw runtime_error("Host is already initialized!");
	}

	this->applicationId = applicationId;
	this->hostPort = port;
	ofLogNotice("Network", "Initialized host for application %d on port %d", applicationId, port);
	network = new NetworkManager();
	network->SetupUDPReceiver(port, 10000, true);
	initialized = true;
}

void NetworkHost::PushMessageForSending(spt<NetOutputMessage> msg) {
	if (this->GetPeersNum() > 0) {
		if (msg->IsUpdateSample() && msg->GetMsgTime() == 0) {
			throw runtime_error("Update messages must have time configured");
		}

		for (auto peer : peers) {
			peer.second->messagesToSend.push_back(msg);
		}
	}
}

void NetworkHost::PushMessageForSending(spt<NetOutputMessage> msg, int peerId) {
	if (this->GetPeersNum() > 0) {
		if (msg->IsUpdateSample()  && msg->GetMsgTime() == 0) {
			throw runtime_error("Update messages must have time configured");
		}

		auto found = peers.find(peerId);

		if(found != peers.end()) {
			found->second->messagesToSend.push_back(msg);
		}
	}
}

void NetworkHost::ClosePeer(int id) {

	ofLogNotice("Network", "Closing client %d", id);

	const auto peerTb = peers.find(id);

	if (peerTb != peers.end()) {
		auto peer = peerTb->second;

		SendMsg(ACT_NET_DISCONNECTED, peers[id]);
		peer->messagesToSend.clear();
		peers.erase(peerTb);
		delete peer;
	}
}


int NetworkHost::ConnectToPeer(string ip, int port) {
	if (!initialized) throw runtime_error("Host is not initialized!");

	const int newId = peerCounter++;
	auto newPeerCtx = new PeerContext();
	newPeerCtx->peerIp = ip;
	newPeerCtx->peerPort = port;
	newPeerCtx->id = newId;
	peers[newId] = newPeerCtx;

	ofLogNotice("Network", "Assigned peerId %d", newId);

	return newId;
}


void NetworkHost::Update(uint64_t delta, uint64_t absolute) {
	if (initialized) {
		UpdateListening(absolute);
		UpdateCommunicating(absolute);
	}
}

void NetworkHost::UpdateListening(uint64_t time) {
	while (true) {
		auto message = network->ReceiveUDPMessage(applicationId, 0, false);

		if (message) {
			if (message->GetPeerId() != 0) {
				// get message from peer
				this->ProcessPeerMessage(message, time);
			}
			else if (message->GetMsgType() == NetMsgType::DISCOVER_REQUEST) {
				// received discover request -> send discover response
				ofLogNotice("Network", "Received discover message from %s:%d", message->GetSourceIp().c_str(), message->GetSourcePort());

				// use listener to answer this message
				network->SetupUDPSender(message->GetSourceIp(), message->GetSourcePort(), true);
				const auto response = std::make_shared<NetOutputMessage>(1, 0, NetMsgType::DISCOVER_RESPONSE);
				network->SendUDPMessage(applicationId, response);
			}
			else if (message->GetMsgType() == NetMsgType::CONNECT_REQUEST) {
				// received connect request -> send connect response 
				ofLogNotice("Network", "Connected peer %s", message->GetSourceIp().c_str());
				auto newPeerId = this->ConnectToPeer(message->GetSourceIp(), message->GetSourcePort());
				peers[newPeerId]->lastReceivedMsgTime = time;

				// notify other components
				SendMsg(ACT_NET_CONNECTED, peers[newPeerId]);

				// send confirmation message
				network->SetupUDPSender(message->GetSourceIp(), message->GetSourcePort(), true);
				const auto msg = std::make_shared<NetOutputMessage>(1, newPeerId, NetMsgType::CONNECT_RESPONSE);
				network->SendUDPMessage(applicationId, msg);
			}
		}else {
			break;
		}
	}
}

void NetworkHost::UpdateCommunicating(uint64_t time) {

	set<int> peersToDisconnect;

	for (const auto peer : peers) {
		if (!peer.second->postponed && (time - peer.second->lastReceivedMsgTime) > postponeTimeout * 1000) {
			ofLogNotice("Network", "No message received from peer %d for %d s, connection marked as lost...", peer.first, postponeTimeout);
			peer.second->postponed = true;
		}

		if (peer.second->postponed && (time - peer.second->lastReceivedMsgTime) > disconnectTimeout * 1000) {
			ofLogNotice("Network", "No message received from peer %d for %d s, disconnecting...", peer.first, disconnectTimeout);
			peersToDisconnect.insert(peer.first);
		}
	}

	// Close disconnected peers
	for (auto peerId : peersToDisconnect) {
		ClosePeer(peerId);
	}

	// Process messages to send
	if (CheckTime(lastSendingTime, time, sendingFrequency)) {
		lastSendingTime = time;

		for (const auto peer : peers) {
			if (!peer.second->postponed) {
				// send all messages for this peer
				SendMessages(time, peer.second);
			}
		}
	}
}

void NetworkHost::SendMessages(uint64_t time, PeerContext* ctx) const {

	network->SetupUDPSender(ctx->peerIp, ctx->peerPort, true);

	int counter = 0;
	if (!ctx->messagesToSend.empty()) {

		for (auto& msg : ctx->messagesToSend) {
			ctx->lastSentMsgId++;
			if (ctx->lastSentMsgId == 0) ctx->lastSentMsgId++; // zero is for undefined sync messages

			// the syncId may differ for each peer, however the message is serialized into a stream for each peer anyway
			msg->SetSyncId(ctx->lastSentMsgId);
			msg->SetMsgType(NetMsgType::UPDATE);

			if (msg->IsReliable()) {
				// reliable message has to be confirmed. Hence, there can't be two 
				// reliable messages with the same time value
				msg->SetMsgTime(time + (counter++));
				ctx->unconfirmedMessages[msg->GetSyncId()] = msg;
			}
			
			network->SendUDPMessage(applicationId, msg);
		}

		// send all messages that haven't been confirmed
		for (auto& key : ctx->unconfirmedMessages) {
			network->SendUDPMessage(applicationId, key.second);
		}

		ctx->messagesToSend.clear();
	}
}

void NetworkHost::ProcessPeerMessage(spt<NetInputMessage> message, uint64_t time) {
	
	auto peer = peers.find(message->GetPeerId());
	if (peer != peers.end()) {
		auto peerCtx = peer->second;
		peerCtx->postponed = false; // reset the postpone indicator

		const auto type = message->GetMsgType();
		if ((type == NetMsgType::UPDATE || type == NetMsgType::ACCEPT)) {
			// got update or acceptation message
			peerCtx->lastReceivedMsgTime = time;
			ProcessUpdateMessage(message, peerCtx);
		}
		else if (type == NetMsgType::DISCONNECT) {
			ofLogNotice("Network", "Peer %s has disconnected", message->GetSourceIp().c_str());
			ClosePeer(peerCtx->id);
		}
		else if (type == NetMsgType::CONNECT_REQUEST) {
			ofLogNotice("Network", "Peer %s is reconnecting", message->GetSourceIp().c_str());
			peerCtx->lastReceivedMsgTime = time;
			const auto msg = std::make_shared<NetOutputMessage>(1, peerCtx->id, NetMsgType::CONNECT_RESPONSE);
			// notify other components
			SendMsg(ACT_NET_CONNECTED, peerCtx);
			network->SetupUDPSender(peerCtx->peerIp, peerCtx->peerPort, true);
			network->SendUDPMessage(applicationId, msg);
		}
		else if (type == NetMsgType::BEEP) {
			// the peer is just leeting us know it is still alive, even if it doesn't have any data to send
			peerCtx->lastReceivedMsgTime = time;
		}
	}
}

void NetworkHost::ProcessUpdateMessage(spt<NetInputMessage> message, PeerContext* peer) {
	const ABYTE acceptedMsgId = message->GetConfirmationId();
	if (acceptedMsgId != 0) {
		// got id of a confirmation message
		ofLogNotice("Network", "Received confirmation of %d ", (int)acceptedMsgId);
		peer->unconfirmedMessages.erase(acceptedMsgId);
	}

	if (message->GetMsgType() == NetMsgType::UPDATE) {
		if (message->GetSyncId() > peer->lastReceivedMsgId || (peer->lastReceivedMsgId - message->GetSyncId()) > 128
			|| (!message->IsUpdateSample())) {
			// old messages can be still processed but not update messages, because old updates are not important anymore

			// synchronization ids may be in range 0-255 so if the difference is greater than 128 it means that
			// the numbering goes from zero again
			if (message->GetSyncId() > peer->lastReceivedMsgId || peer->lastReceivedMsgId - message->GetSyncId() > 128)
				peer->lastReceivedMsgId = message->GetSyncId();

			//ofLogNotice("Network_sync", "received %d", message->GetSyncId());
			SendMsg(ACT_NET_MESSAGE_RECEIVED, message.get());
		}
	}
}
