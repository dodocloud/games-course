// hashing function
inline unsigned SDBMHash(unsigned hash, unsigned char c) { 
	return c + (hash << 6) + (hash << 16) - hash; 
}
 
unsigned calc(const char* str, unsigned hash = 0) {
    while (*str) {
        // Perform the current hashing as case-insensitive
        char c = *str;
        hash = SDBMHash(hash, (unsigned char)tolower(c));
        ++str;
    }
    return hash;
}