#pragma once

#include <cmath>
#include <algorithm>
#include "AphMain.h"
using namespace std;

/**
* Writer of byte array that is supposed to be sent to the remote endpoint
*/
class NetWriter {
private:
	ABYTE* buffer;
	// pointer to the current byte in buffer
	ABYTE* current;
	// length of the buffer
	unsigned bufferLength;
	// offset of bit in actual byte
	unsigned bitOffset;

public:

	/**
	* Creates a new NetWriter
	* @param capacity buffer capacity
	*/
	NetWriter(unsigned capacity);

	/**
	* Writes a bit value into the buffer
	*/
	void WriteBit(bool value);

	/**
	* Writes a byte into the buffer
	*/
	void WriteByte(ABYTE value);

	/**
	* Writes a word into the buffer
	*/
	void WriteWord(AWORD value);

	/**
	* Writes a double word into the buffer
	*/
	void WriteDWord(ADWORD value);

	/**
	* Writes a float into the buffer
	*/
	void WriteFloat(float value);

	/**
	* Writes array of bytes into the buffer
	* @param data byte array
	* @param size size of the array in bytes
	*/
	void WriteBytes(ABYTE* data, unsigned size);

	/**
	* Writes array of double words into the buffer
	* @param data array
	* @param size size of the array in bytes
	*/
	void WriteDWords(ADWORD* data, unsigned size);

	/**
	* Writes array of floats into the buffer
	* @param data array
	* @param size size of the array in bytes
	*/
	void WriteFloats(float* data, unsigned size);

	/**
	* Writes string into the buffer
	*/
	void WriteString(string str);

	/**
	* Gets pointer to the buffer
	*/
	ABYTE* GetBuffer() const {
		return buffer;
	}

	/**
	* Copies data into a byte array and returns a pointer to it
	*/
	ABYTE* CopyData(unsigned& size);

	/**
	* Gets capacity of the buffer in bits
	*/
	unsigned GetBufferBites() const {
		return bufferLength;
	}

	/**
	* Gets number of used bits
	*/
	unsigned GetUsedBites() const {
		return (current - buffer) * 8 + bitOffset;
	}

	/**
	* Resets buffer pointer and offset
	*/
	void Reset() {
		this->current = buffer;
		this->bitOffset = 0;
		*current = 0;
	}

private:
	inline bool FreeSpace(unsigned bits) {
		return (bufferLength - GetUsedBites()) >= bits;
	}

	inline void IncrementCurrent() {
		current++;
		*current = 0;
	}
};
