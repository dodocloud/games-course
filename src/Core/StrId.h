#pragma once

#include <string>
#include <map>
#include "ofUtils.h"

using std::map;
using std::string;


/**
* Entity that transforms string into unsigned value;
* can be used as a replacement of strings for performance-critical parts such as maps
*/
class StrId {
public:

	StrId() : val(0) {}

	StrId(const StrId& rhs) : val(rhs.val) {}

	explicit StrId(unsigned value) : val(value) {}

	StrId(const char* str);

	StrId(const string& str);

	StrId& operator =(const StrId& rhs) {
		val = rhs.val;
		return *this;
	}

	StrId operator +(const StrId& rhs) const {
		StrId ret;
		ret.val = val + rhs.val;
		return ret;
	}

	StrId& operator +=(const StrId& rhs) {
		val += rhs.val;
		return *this;
	}

	bool operator ==(const StrId& rhs) const { return val == rhs.val; }
	bool operator !=(const StrId& rhs) const { return val != rhs.val; }
	bool operator <(const StrId& rhs) const { return val < rhs.val; }
	bool operator >(const StrId& rhs) const { return val > rhs.val; }

	operator unsigned() const { return val; }

	/**
	* Gets the hash value
	*/
	unsigned GetValue() const { return val; }

	/**
	* Calculates hash value from C string, using SDBM algorithm
	*/
	static unsigned Calculate(const char* str);


private:
	// hash value.
	unsigned val;

};