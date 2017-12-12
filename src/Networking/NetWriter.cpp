#include "NetWriter.h"


NetWriter::NetWriter(unsigned capacity) {
	this->buffer = new ABYTE[capacity];
	this->bufferLength = capacity * 8;
	this->current = buffer;
	this->bitOffset = 0;
	*current = 0;
}

void NetWriter::WriteBit(bool value) {
	ASSERT(FreeSpace(1), "NetWriter", "Buffer length exceeded");

	*current &= (0xFF << (8 - bitOffset));
	*current |= ((value ? 1 : 0) << (7 - bitOffset));
	bitOffset++;

	if (bitOffset >= 8) {
		IncrementCurrent();
		bitOffset = 0;
	}
}

void NetWriter::WriteByte(ABYTE value) {
	ASSERT(FreeSpace(8), "NetWriter", "Buffer length exceeded");
	if (bitOffset <= 0) {
		// no offset
		*(current) = value;
		IncrementCurrent();
	}
	else {
		// first part | second part
		*current = (*current & (0xFF << (8 - bitOffset))) | (value >> bitOffset);
		IncrementCurrent();
		*current = value << (8 - bitOffset);
	}
}

void NetWriter::WriteWord(AWORD value) {
	ASSERT(FreeSpace(16), "NetWriter", "Buffer length exceeded");
	WriteByte(value >> 8);
	WriteByte(value);
}

void NetWriter::WriteDWord(ADWORD value) {
	ASSERT(FreeSpace(32), "NetWriter", "Buffer length exceeded");
	WriteByte(value >> 24);
	WriteByte(value >> 16);
	WriteByte(value >> 8);
	WriteByte(value);
}

void NetWriter::WriteFloat(float value) {
	ASSERT(FreeSpace(32), "NetWriter", "Buffer length exceeded");

	ADWORD ivalue = *((ADWORD*)&value);
	WriteDWord(ivalue);
}

void NetWriter::WriteBytes(ABYTE* data, unsigned size) {
	ASSERT(FreeSpace(size * 8), "NetWriter", "Buffer length exceeded");

	if (bitOffset <= 0) {
		// no offset
		memcpy(current, data, size);
		current += size;
		*current = 0;
	}
	else {
		// align each byte...
		for (unsigned i = 0; i < size; i++) {
			WriteByte(data[i]);
		}
	}
}

void NetWriter::WriteDWords(ADWORD* data, unsigned size) {
	ASSERT(FreeSpace(size * 32), "NetWriter", "Buffer length exceeded");

	for (unsigned i = 0; i < size; i++) {
		WriteDWord(data[i]);
	}
}

void NetWriter::WriteFloats(float* data, unsigned size) {
	ASSERT(FreeSpace(size * 32), "NetWriter", "Buffer length exceeded");

	for (unsigned i = 0; i < size; i++) {
		WriteFloat(data[i]);
	}
}

void NetWriter::WriteString(string str) {
	ASSERT(FreeSpace(str.size() * 8 + 32), "NetWriter", "Buffer length exceeded");
	ASSERT(str.size() < 100000, "NetWriter", "String limit exceeded");

	// write info about size separately
	WriteDWord(str.size());
	WriteBytes((ABYTE*)str.c_str(), str.size());
}

ABYTE* NetWriter::CopyData(unsigned& size) {
	size = current - buffer;
	if (bitOffset > 0) size++;
	ABYTE* data = new ABYTE[size];
	memcpy(data, buffer, size);
	return data;
}
