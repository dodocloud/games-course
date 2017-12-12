#include "NetMessage.h"


void NetInputMessage::LoadFromStream(NetReader* reader) {

	this->syncId = reader->ReadByte();
	this->confirmId = reader->ReadByte();
	this->peerId = reader->ReadByte();
	this->msgType = (NetMsgType)reader->ReadByte();
	this->action = StrId(reader->ReadDWord());
	this->msgTime = reader->ReadDWord();
	this->isReliable = reader->ReadBit();
	this->isUpdateSample = reader->ReadBit();
	reader->ReadBit();
	reader->ReadBit();
	reader->ReadBit();
	reader->ReadBit();
	reader->ReadBit();
	reader->ReadBit();

	if (this->dataLength != 0) {
		this->data = new ABYTE[this->dataLength];
		reader->ReadBytes(this->data, this->dataLength);
	}
}

void NetOutputMessage::SaveToStream(NetWriter* writer) const {

	writer->WriteByte(this->syncId);
	writer->WriteByte(this->confirmId);
	writer->WriteByte(this->peerId);
	writer->WriteByte((ABYTE)this->msgType);
	writer->WriteDWord(this->action.GetValue());
	writer->WriteDWord(this->msgTime);
	
	// write the last byte
	writer->WriteBit(this->isReliable);
	writer->WriteBit(this->isUpdateSample);
	writer->WriteBit(false);
	writer->WriteBit(false);
	writer->WriteBit(false);
	writer->WriteBit(false);
	writer->WriteBit(false);
	writer->WriteBit(false);

	if (this->data != nullptr) {
		data->SaveToStream(writer);
	}
}