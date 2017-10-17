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
#   define COGASSERT(condition, message, ...) do { } while (false)
#endif