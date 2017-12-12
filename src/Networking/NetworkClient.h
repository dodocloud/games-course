#pragma once

#include "AphMain.h"
#include "Component.h"
#include <unordered_set>
#include "NetMessage.h"


class NetOutputMessage;
class NetworkManager;

// messages for component architecture
extern StrId ACT_NET_CONNECTED;					// peer connected
extern StrId ACT_NET_MESSAGE_RECEIVED;			// a new message received
extern StrId ACT_NET_DISCONNECTED;				// peer disconnected
extern StrId ACT_NET_CONNECTION_LOST;			// connection with host is lost

/**
* State of network client
*/
enum class ClientState {
	NONE,					/** undefined */
	DISCOVERING,			/** discovering hosts */
	CONNECTING,				/** connecting to a host */
	COMMUNICATING			/** communicating with host */
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
class NetworkClient : public Component {

private:
	NetworkManager* network = nullptr;				// communicator
	ClientState networkState = ClientState::NONE;	// current network state
	ABYTE applicationId;							// application id
	string hostIp = "";								// host ip address
	int hostPort;									// port of the host
	int clientPort;									// port of the client


	// collection of ids of messages that haven't been confirmed yet
	set<ABYTE> forConfirmationMessageIds;
	// collection of arrival times of not confirmed messages (used for optimization)
	set<uint64> forConfirmationMessageTimes;
	// identifier of last received message
	ABYTE lastReceivedMsgId = -1;
	// time of creation of the last received message
	uint64 lastReceivedMsgTime = 0;
	// identifier of the last message that was sent to the host
	ABYTE lastSentMsgId = 0;

	// collection of messages that will be sent in the next update
	vector<spt<NetOutputMessage>> messagesToSend;

	// number of broadcasts per second
	float broadcastingFrequency = 0.5f;
	// number of sending cycles per second
	float sendingFrequency = 10;
	// number of reconnects per second
	float connectingFrequency = 2;
	// number of beep messages per seconds (beep messages only lets the server know the peer is still here)
	float beepFrequency = 2 ;

	uint64 lastBroadcastTime = 0;
	uint64 lastSendingTime = 0;
	uint64 lastConnectingTime = 0;
	// number of seconds after which the connection will be made again
	int reconnectTimeout = 4;
	// number of seconds the per will be automatically disconnected
	int disconnectTimeout = 10;
	// indicator whether the client should connect to the first host it finds
	bool autoConnect = false;
	// set of ip adresses of discovered hosts
	set<string> discoveredHosts;
	// identifier of this client
	int clientId = 0;
public:

	/**
	* Gets network current status
	*/
	ClientState GetNetworkState() const {
		return networkState;
	}

	/**
	 * Gets an indicator whether the peer is connected to a host
	 */
	bool IsConnected() const {
		return networkState == ClientState::COMMUNICATING;
	}

	/**
	* Gets id of current application
	*/
	ABYTE GetApplicationId() const {
		return applicationId;
	}

	/**
	* Gets ip address of the host
	*/
	string GetHostIp() const {
		return hostIp;
	}

	/**
	* Gets port of the host
	*/
	int GetHostPort() const {
		return hostPort;
	}

	/**
	* Gets indicator whether the client should connect to the first host it finds
	*/
	bool AutoConnect() const {
		return autoConnect;
	}

	/**
	* Sets indicator whether the client should connect to the first host it finds
	*/
	void SetAutoConnect(bool autoConnect) {
		this->autoConnect = autoConnect;
	}

	/**
	 * Gets the set of ip addresses of all discovered hosts
	 */
	set<string>& GetDiscoveredHosts() {
		return discoveredHosts;
	}

	/**
	* Gets time the last message was received
	*/
	uint64 GetLastReceivedMsgTime() const {
		return lastReceivedMsgTime;
	}

	/**
	* Gets number of broadcasts per second
	*/
	float GetBroadcastingFrequency() const {
		return broadcastingFrequency;
	}

	/**
	* Sets number of broadcasts per second
	*/
	void SetBroadcastingFrequency(float frequency) {
		this->broadcastingFrequency = frequency;
	}

	/**
	* Gets number of sending cycles per second
	*/
	float GetSendingFrequency() const {
		return sendingFrequency;
	}

	/**
	* Sets number of sending cycles per second
	*/
	void SetSendingFrequency(float frequency) {
		this->sendingFrequency = frequency;
	}

	/**
	* Gets number of connection attempts per second
	*/
	float GetConnectingFrequency() const {
		return connectingFrequency;
	}

	/**
	* Sets number of connection attempts per second
	*/
	void SetConnectingFrequency(float frequency) {
		this->connectingFrequency = frequency;
	}

	/**
	* Gets number of seconds after which the peer will try to reconnect
	*/
	int GetReconnectTimeout() const {
		return reconnectTimeout;
	}

	/**
	* Sets number of seconds after which the peer will try to reconnect
	*/
	void SetReconnectTimeout(int reconnectTimeout) {
		this->reconnectTimeout = reconnectTimeout;
	}

	/**
	* Gets number of seconds after which the connection will be closed
	*/
	int GetDisconnectTimeout() const {
		return disconnectTimeout;
	}

	/**
	* Sets number of seconds after which the connection will be closed
	*/
	void SetDisconnectTimeout(int disconnectTimeout) {
		this->disconnectTimeout = disconnectTimeout;
	}

	/**
	* Initializes broadcasting mode, trying to found a peer
	* @param applicationId id of the current application
	* @param clientPort listening port
	* @param hostPort port of the target host
	* @param hostIp ip address of the host. If empty, the default subnets (192.x.x.x and 10.x.x.x) will be searched
	*/
	void InitClient(ABYTE applicationId, int clientPort, int hostPort, string hostIp = "");


	/**
	* Pushes a message that will be sent with the next sending cycle
	*/
	void PushMessageForSending(spt<NetOutputMessage> msg);

	/**
	* Closes the connection
	*/
	void Close();

	virtual void Update(uint64_t delta, uint64_t absolute);

protected:
	/** Connects to host with given ip address */
	void ConnectToHost(string ip, int port);
	/** Update for discovering state */
	void UpdateDiscovering(uint64_t absolute);
	/** Update for connecting state */
	void UpdateConnecting(uint64_t absolute);
	/** Update for communicating state */
	void UpdateCommunicating(uint64_t absolute);
	/** Processes a message from the host */
	void ProcessUpdateMessage(spt<NetInputMessage> message);

	/**
	* Sends queued messages and re-sends those that weren't still confirmed
	*/
	void SendMessages(uint64_t time);
};
