#pragma once

#include <cmath>
#include <algorithm>
#include "AphMain.h"

using namespace std;

// max size of serialized string
#define STR_MAX_SIZE 10000

/**
* Reader of byte array received from internet
*/
class NetReader {
private:
	ABYTE* buffer;
	// pointer to current byte in buffer
	ABYTE* current;
	// length of the buffer
	unsigned bufferLength;
	// offset of bit in actual byte
	unsigned bitOffset;
	// if true, data won't be destructed
	bool external;

public:

	/**
	* Creates a new NetReader
	* @param capacity buffer capacity in bytes
	*/
	NetReader(unsigned capacity);

	/**
	* Creates a new NetReader
	* @param data data to read
	* @param capacity (size of data to read) in bytes
	*/
	NetReader(ABYTE* data, unsigned capacity);

	~NetReader() {
		if (!external) delete[] buffer;
	}

	/**
	* Reads bit into bool
	*/
	void ReadBit(bool& value);

	/**
	* Reads bit as a bool
	*/
	inline bool ReadBit() {
		bool output = false;
		ReadBit(output);
		return output;
	}

	/**
	* Reads byte into output value
	*/
	void ReadByte(ABYTE& value);

	/**
	* Reads byte
	*/
	inline ABYTE ReadByte() {
		ABYTE output = 0;
		ReadByte(output);
		return output;
	}

	/**
	* Reads word into output value
	*/
	void ReadWord(AWORD& value);

	/**
	* Reads word
	*/
	inline AWORD ReadWord() {
		AWORD output = 0;
		ReadWord(output);
		return output;
	}

	/**
	* Reads double word into output value
	*/
	void ReadDWord(ADWORD& value);

	/**
	* Reads double word
	*/
	inline ADWORD ReadDWord() {
		ADWORD output = 0;
		ReadDWord(output);
		return output;
	}

	/**
	* Reads float into output value
	*/
	void ReadFloat(float& value);

	/**
	* Reads float
	*/
	inline float ReadFloat() {
		float output = 0;
		ReadFloat(output);
		return output;
	}

	/**
	* Reads array of bytes of a given size
	* @param data array of bytes to read
	* @param size size of array in bytes
	*/
	void ReadBytes(ABYTE* data, unsigned size);

	/**
	* Reads array of bytes and returns pointer to the first byte
	* @param size size of array in bytes
	*/
	ABYTE* ReadBytes(unsigned size) {
		ABYTE* output = new ABYTE[size];
		ReadBytes(output, size);
		return output;
	}

	/**
	* Reads array of double words of a given size
	* @param data array of double words to read
	* @param size size of array in bytes
	*/
	void ReadDWords(ADWORD* data, unsigned size);

	/**
	* Reads array of double words and returns pointer to the first one
	* @param size size of array in bytes
	*/
	ADWORD* ReadDWords(unsigned size) {
		ADWORD* output = new ADWORD[size];
		ReadDWords(output, size);
		return output;
	}

	/**
	* Reads array of floats of a given size
	* @param data array of floats to read
	* @param size size of array in bytes
	*/
	void ReadFloats(float* data, unsigned size);

	/**
	* Reads array of floats and returns pointer to the first one
	* @param size size of array in bytes
	*/
	float* ReadFloats(unsigned size) {
		float* output = new float[size];
		ReadFloats(output, size);
		return output;
	}

	/**
	* Reads string
	*/
	string ReadString();

	/**
	* Gets pointer to the buffer
	*/
	ABYTE* GetBuffer() {
		return buffer;
	}

	/**
	* Gets pointer to the actual position in buffer
	*/
	ABYTE* GetActualPointer() {
		return current;
	}

	/**
	* Gets capacity of buffer in bits
	*/
	unsigned GetBufferBites() {
		return bufferLength;
	}

	/**
	* Reset buffer position
	*/
	void Reset() {
		this->current = buffer;
		this->bitOffset = 0;
	}

private:
	inline bool FreeSpace(unsigned bits) {
		return (bufferLength - (buffer - current)) * 8 - bitOffset >= bits;
	}
};
