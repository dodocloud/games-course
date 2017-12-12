#pragma once

#include "NetReader.h"
#include "NetWriter.h"
#include "StrId.h"
#include "AphMain.h"

/**
* Enums fornetwork message
*/
enum class NetMsgType {
	DISCOVER_REQUEST = 1,
	DISCOVER_RESPONSE = 2,
	CONNECT_REQUEST = 3,
	CONNECT_RESPONSE = 4,
	UPDATE = 5, // update messages, the alpha and omega of the whole communication
	ACCEPT = 6, // message that only accepts a prevously sent reliable payload
	DISCONNECT = 7,
	BEEP = 8 // beep message used to let the server know the client is still here, event if it has nothing to send
};

/**
* Abstract base class for entities that are part of network message
* as a payload; both NetInputMessage and NetOutputMessage may contain a payload
*/
class NetData {
public:

	virtual ~NetData() = default;
	
	/**
	* Loads object from a stream
	*/
	virtual void LoadFromStream(NetReader* reader) = 0;

	/**
	* Saves objects into a stream
	*/
	virtual void SaveToStream(NetWriter* writer) = 0;

	/**
	* Gets length of the data, very important for serialization
	*/
	virtual int GetDataLength() = 0;
};

/**
 * Base class for both NetInputMessage and NetOutputMessage, contains header data of all communication messages
 */
class NetMessage {
protected:
	// synchronization id
	ABYTE syncId = 0;
	// confirmation id (id of a confirmed reliable message)
	ABYTE confirmId = 0;
	// either source or target peer id
	ABYTE peerId = 0;
	// type of message
	NetMsgType msgType = NetMsgType::UPDATE;
	// type of action
	StrId action = StrId();
	// time in which the message was sent
	ADWORD msgTime = 0;
	// if true, the message is required to be accepted by the client
	bool isReliable = false;
	// if true, the message contains an update sample
	bool isUpdateSample = false;

public:
	/**
	* Gets synchronization id
	*/
	ABYTE GetSyncId() const {
		return syncId;
	}

	/**
	 * Sets the synchronization id
	 */
	void SetSyncId(ABYTE syncId) {
		this->syncId = syncId;
	}

	/**
	* Gets the confirmation id
	*/
	ABYTE GetConfirmationId() const {
		return confirmId;
	}

	/**
	 * Sets the confirmation id
	 */
	void SetConfirmationId(ABYTE confirmId) {
		this->confirmId = confirmId;
	}

	/**
	* Gets the peer id
	*/
	ABYTE GetPeerId() const {
		return peerId;
	}

	/**
	 * Sets the peer id
	 */
	void SetPeerId(ABYTE peerId) {
		this->peerId = peerId;
	}

	/**
	* Gets the type of the message
	*/
	NetMsgType GetMsgType() const {
		return msgType;
	}

	/**
	 * Sets the type of the message
	 */
	void SetMsgType(NetMsgType type) {
		this->msgType = type;
	}

	/**
	* Gets the time the message was sent
	*/
	ADWORD GetMsgTime() const {
		return msgTime;
	}

	/**
	* Sets the time the message was sent
	*/
	void SetMsgTime(ADWORD time) {
		this->msgTime = time;
	}

	/**
	* Gets the type of an action this message represents
	*/
	StrId GetAction() const {
		return action;
	}

	/**
	* Sets the type of an action this message represents
	*/
	void SetAction(StrId action) {
		this->action = action;
	}

	/**
	 * Gets an indicator whether this message should be confirmed
	 */
	bool IsReliable() const {
		return isReliable;
	}

	/**
	 * Sets an indicator whether this message should be confirmed
	 */
	void SetIsReliable(bool isReliable) {
		this->isReliable = isReliable;
	}

	/**
	 * Gets an indicator whether this message contains an update sample (updates aren't usually required to be confirmed)
	 */
	bool IsUpdateSample() const {
		return isUpdateSample;
	}

	/**
	 * Sets an indicator whether this message contains an update sample
	 */
	void SetIsUpdateSample(bool isUpdateSample) {
		this->isUpdateSample = isUpdateSample;
	}

	/**
	* Gets length of the header in bytes
	*/
	static constexpr int GetHeaderLength() {
		return 	1 // sync id
			+ 1 // confirmation id
			+ 1 // peer id
			+ 1 // msgType
			+ 4 // action
			+ 4 // msgTime
			+ 1; // booleans + reserve
	}
};

/**
* Network read-only message that was received
*/
class NetInputMessage : public NetMessage {
private:
	// source ip address
	string sourceIp;
	// source port
	int sourcePort;
	// data payload
	ABYTE* data = nullptr;
	// length of data payload
	int dataLength = 0;

public:
	/**
	* Creates a new input message
	* @param messageLength length of the data payload
	*/
	NetInputMessage(int messageLength) {
		this->dataLength = messageLength - GetHeaderLength();
	}

	/**
	* Creates a new input message
	* @param messageLength length of the data payload
	* @param syncId synchronization id
	*/
	NetInputMessage(int messageLength, ABYTE syncId) : NetInputMessage(messageLength) {
		this->syncId = syncId;
	}

	/**
	* Creates a new input message
	* @param messageLength length of the data payload
	* @param syncId synchronization id
	* @param msgType type of the message
	*/
	NetInputMessage(int messageLength, ABYTE syncId, NetMsgType msgType)
		: NetInputMessage(messageLength, syncId) {
		this->msgType = msgType;
	}

	~NetInputMessage() {
		delete[] data;
	}

	/**
	* Gets source ip address
	*/
	string GetSourceIp() const {
		return sourceIp;
	}

	/**
	* Gets source port
	*/
	int GetSourcePort() const {
		return sourcePort;
	}

	/**
	* Gets data payload
	*/
	ABYTE* GetData() const {
		return data;
	}

	/**
	* Gets data payload by type, using the LoadFromStream method
	* The type of the data payload should be determined by the type of the message
	* together with the type of the action
	*/
	template<class T>
	spt<T> GetData() {
		auto netReader = new NetReader(data, GetDataLength());
		spt<T> innerMsg = std::make_shared<T>();
		innerMsg->LoadFromStream(netReader);
		return innerMsg;
	}

	/**
	* Gets the length of the whole message in bytes
	*/
	int GetMessageLength() const {
		return GetHeaderLength() + GetDataLength();
	}


	/**
	* Gets the length of the data payload in bytes
	*/
	int GetDataLength() const {
		return dataLength;
	}


	/**
	* Loads the message from a stream
	*/
	void LoadFromStream(NetReader* reader);

	friend class NetworkManager;
};


/**
* Network message that is serialized into a stream of bytes and sent
* to the destination point
*/
class NetOutputMessage : public NetMessage {
private:

	// data payload
	NetData* data = nullptr;

public:
	NetOutputMessage(){}

	/**
	* Creates a new output message
	* @param syncId synchronization id
	*/
	NetOutputMessage(ABYTE syncId, ABYTE peerId) {
		this->syncId = syncId;
		this->peerId = peerId;
	}

	/**
	* Creates a new output message
	* @param syncId synchronization id
	* @param msgType type of the message
	*/
	NetOutputMessage(ABYTE syncId, NetMsgType msgType) {
		this->syncId = syncId;
		this->msgType = msgType;
	}

	/**
	* Creates a new output message
	* @param syncId synchronization id
	* @param peerId id of the peer to whom the message is intended
	* @param msgType type of the message
	*/
	NetOutputMessage(ABYTE syncId, ABYTE peerId, NetMsgType msgType) {
		this->syncId = syncId;
		this->peerId = peerId;
		this->msgType = msgType;
	}

	/**
	* Creates a new output message
	* @param action type of the action this message represents
	* @param data data payload
	* @param isUpdateSample indicator whether this message contains an update sample
	* @param isReliable indicator whether this message should be confirmed by the host
	*/
	NetOutputMessage(StrId action, NetData* data, bool isUpdateSample, bool isReliable) {
		this->action = action;
		this->data = data;
		this->isUpdateSample = isUpdateSample;
		this->isReliable = isReliable;
	}

	/**
	* Creates a new output message
	* @param action type of the action this message represents
	* @param data data payload
	* @param time the time of creation of this message
	* @param isUpdateSample indicator whether this message contains an update sample
	* @param isReliable indicator whether this message should be confirmed by the host
	*/
	NetOutputMessage(StrId action, NetData* data, uint64_t time, bool isUpdateSample, bool isReliable) {
		this->action = action;
		this->data = data;
		this->msgTime = time;
		this->isUpdateSample = isUpdateSample;
		this->isReliable = isReliable;
	}

	~NetOutputMessage() {
		delete data;
	}


	/**
	* Gets the data payload
	*/
	NetData* GetData() const {
		return data;
	}

	/**
	* Sets the data payload
	*/
	void SetData(NetData* data) {
		this->data = data;
	}

	/**
	* Gets length of the message, including data payload (if attached)
	*/
	int GetMessageLength() const {
		return (data == nullptr ? 0 : data->GetDataLength())
			+ GetHeaderLength();

	}

	/**
	* Saves data into a stream
	*/
	void SaveToStream(NetWriter* writer) const;
};
