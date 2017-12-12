#pragma once

#include "AphMain.h"
#include "Component.h"
#include <unordered_set>
#include "NetMessage.h"
#include "NetworkClient.h"

/**
 * Context data for each peer
 */
struct PeerContext {
	int id;					// assigned identifier of the peer
	string peerIp = "";		// ip address of the peer
	int peerPort;			// port of the peer
	

	// identifier of last received message
	ABYTE lastReceivedMsgId = -1;
	// creation time of the last received message
	uint64 lastReceivedMsgTime = 0;
	// identifier of the last sent message
	ABYTE lastSentMsgId = 0;
	// collection of not confirmed messages that will be re-sent repeatedly
	map<ABYTE, spt<NetOutputMessage>> unconfirmedMessages;
	// collection of messages that will be sent during the next update cycle
	vector<spt<NetOutputMessage>> messagesToSend;
	// indicator whether the client is marked as missing
	bool postponed = false;
};

/**
* Component that communicates over network using UDP protocol and
* sends synchronization messages
*
* May be used primarily for multiplayer
* All messages have their synchronization id and the important ones must be
* confirmed using the confirmation id that is packed together with regular messages
*
* The frequency of message exchange can also be regulated
*/
class NetworkHost : public Component {

private:
	ABYTE applicationId;				// id of the application
	int hostPort;						// port of the host			
	bool initialized = false;			// indicator whether the component has been initialized
	NetworkManager* network = nullptr;	// network communicator
	
	// all peers mapped by their ids
	map<ABYTE, PeerContext*> peers;
	// number of sending cycles per second
	float sendingFrequency = 10;
	uint64 lastSendingTime = 0;
	// number of seconds the peer will be marked as missing
	int postponeTimeout = 4;
	// number of seconds the peer will be automatically disconnected
	int disconnectTimeout = 8;
	
	static int peerCounter; // peer id counter
public:

	
	/**
	* Gets id of application that is checked with each incomming message
	*/
	ABYTE GetApplicationId() const {
		return applicationId;
	}

	/**
	 * Gets number of connected peers
	 */
	int GetPeersNum() const {
		return peers.size();
	}

	/**
	* Gets port this host listens on
	*/
	int GetPort() const {
		return hostPort;
	}

	/**
	* Gets the number of sent cycles per second
	*/
	float GetSendingFrequency() const {
		return sendingFrequency;
	}

	/**
	* Sets the number of sent cycles per second
	*/
	void SetSendingFrequency(float frequency) {
		this->sendingFrequency = frequency;
	}

	/**
	* Gets the number of seconds after which the peer will be marked as missing
	*/
	int GetPostponeTimeout() const {
		return postponeTimeout;
	}

	/**
	* Sets the number of seconds after which the peer will be marked as missing
	*/
	void SetPostponeTimeout(int postponeTimeout) {
		this->postponeTimeout = postponeTimeout;
	}

	/**
	* Gets the number of seconds after which the connection will be closed
	*/
	int GetDisconnectTimeout() const {
		return disconnectTimeout;
	}

	/**
	* Sets the number of seconds after which the connection will be closed
	*/
	void SetDisconnectTimeout(int disconnectTimeout) {
		this->disconnectTimeout = disconnectTimeout;
	}

	/**
	* Initializes the host, waiting for other peers to connect
	* @param applicationId id of application that defines the connection; is checked in every received message
	* @param hostPort port this host will listen on
	*/
	void InitHost(ABYTE applicationId, int hostPort);

	/**
	* Pushes a message that will be sent with the next sending cycle
	*/
	void PushMessageForSending(spt<NetOutputMessage> msg);

	/**
	 * Pushes a message that will be sent directly to a given peer
	 */
	void PushMessageForSending(spt<NetOutputMessage> msg, int peerId);

	/**
	* Closes the communication channel with a given peer
	*/
	void ClosePeer(int id);

	/**
	* Connects to a peer with given ip address
	*/
	int ConnectToPeer(string ip, int port);

	virtual void Update(uint64_t delta, uint64_t absolute);

protected:

	/** Update for listening state */
	void UpdateListening(uint64_t time);
	/** Update for communicating state */
	void UpdateCommunicating(uint64_t time);
	/** Processes an incoming general message from a peer  */
	void ProcessPeerMessage(spt<NetInputMessage> message, uint64_t time);
	/** Processes an incoming update message from a peer  */
	void ProcessUpdateMessage(spt<NetInputMessage> message, PeerContext* peer);


	/**
	* Sends queued messages and re-sends those that weren't still confirmed
	*/
	void SendMessages(uint64_t time, PeerContext* peer) const;
};
