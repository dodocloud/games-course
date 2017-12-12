#include "NetReader.h"


NetReader::NetReader(unsigned capacity) {
	this->buffer = new ABYTE[capacity];
	this->bufferLength = capacity * 8;
	this->bitOffset = 0;
	this->current = buffer;
	this->external = false;
}

NetReader::NetReader(ABYTE* data, unsigned capacity) {
	this->buffer = data;
	this->bufferLength = capacity * 8;
	this->bitOffset = 0;
	this->current = data;
	this->external = true;
}

void NetReader::ReadBit(bool& value) {
	ASSERT(FreeSpace(1), "NetReader", "Buffer length exceeded");

	value = (*current & (1 << (7 - bitOffset))) != 0;

	bitOffset++;

	if (bitOffset >= 8) {
		current++;
		bitOffset = 0;
	}
}

void NetReader::ReadByte(ABYTE& value) {
	ASSERT(FreeSpace(8), "NetReader", "Buffer length exceeded");

	if (bitOffset <= 0) {
		// no offset
		value = *current;
		current++;
	}
	else {
		// first part | second part
		value = (*current << bitOffset) | (*(current + 1) >> (8 - bitOffset));
		current++;
	}

}

void NetReader::ReadWord(AWORD& value) {
	ASSERT(FreeSpace(16), "NetReader", "Buffer length exceeded");
	value = 0;
	value |= ReadByte() << 8;
	value |= ReadByte();
}

void NetReader::ReadDWord(ADWORD& value) {
	ASSERT(FreeSpace(32), "NetReader", "Buffer length exceeded");
	value = 0;
	value |= ReadByte() << 24;
	value |= ReadByte() << 16;
	value |= ReadByte() << 8;
	value |= ReadByte();
}

void NetReader::ReadFloat(float& value) {
	ASSERT(FreeSpace(32), "NetReader", "Buffer length exceeded");

	ADWORD iVal = ReadDWord();

	value = *((float*)(&iVal));
}

void NetReader::ReadBytes(ABYTE* data, unsigned size) {
	ASSERT(FreeSpace(size * 8), "NetReader", "Buffer length exceeded");

	if (bitOffset <= 0) {
		// no offset
		memcpy(data, current, size);
		current += size;
	}
	else {
		// align each byte
		for (unsigned i = 0; i < size; i++) {
			ReadByte(data[i]);
		}
	}
}

void NetReader::ReadDWords(ADWORD* data, unsigned size) {
	for (unsigned i = 0; i < size; i++) {
		ReadDWord(data[i]);
	}
}

void NetReader::ReadFloats(float* data, unsigned size) {
	for (unsigned i = 0; i < size; i++) {
		ReadFloat(data[i]);
	}
}

string NetReader::ReadString() {
	ADWORD size = ReadDWord();
	ASSERT(size < STR_MAX_SIZE, "NetReader", "Unexpected string size in byte array");

	ABYTE* bytes = ReadBytes(size);
	string output = string((char*)bytes, (int)size);
	delete bytes;
	return output;
}
