
#include "StrId.h"


StrId::StrId(const char* str) :
	val(Calculate(str)) {
}

StrId::StrId(const string& str) :
	val(Calculate(str.c_str())) {
}

unsigned StrId::Calculate(const char* str) {
	unsigned hash = 0;

	if (!str) return hash;

	while (*str) {
		// SDBM hash, see http://www.cse.yorku.ca/~oz/hash.html
		char c = tolower(*str); // always get lowercase
		hash = ((unsigned char)c) + (hash << 6) + (hash << 16) - hash;
		++str;
	}

	return hash;
}


