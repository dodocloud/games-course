#pragma once

#include "ofMain.h"
#include "AphUtils.h"

// alias for shared pointer
template<typename T>
using spt = std::shared_ptr<T>;


/** Assertion with formatted message, may be used widely
* for time-consuming assertions since it is only for debug mode
*/
#ifdef _DEBUG
#   define ASSERT(condition, module, message, ...) \
    do { \
        if (! (condition)) { \
            std::cerr << "Assertion " #condition " failed in " << __FILE__ \
                      << " line " << __LINE__ << ": " << printf(message, ##__VA_ARGS__) << std::endl; \
             ofLogError(module,message, ##__VA_ARGS__); \
				        } \
		    } while (false)
#else
#   define ASSERT(condition, message, ...) do { } while (false)
#endif

// aliases for data types for networking
typedef unsigned char ABYTE;
typedef unsigned int ADWORD;
typedef unsigned short AWORD;


// macro for calculating size of a string used in networking
// when a string is seralized, the size of a string goes with it
#define SIZE_STR(str) sizeof(ABYTE)*str.size()+sizeof(ADWORD)