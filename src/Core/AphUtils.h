#pragma once

#include <string>
#include <cstdarg>
#include "ofUtils.h"

#define CURRENT_VERSION 2
using namespace std;
typedef unsigned long long uint64;

bool CheckAPHVersion();

string string_format(const char* fmt_str, ...);

void split_string(string str, string delimiter, std::vector<std::string>& output);


/**
 * Returns true, if an event, executed at lastTime, with given frequency,
 * should be executed now
 */
bool CheckTime(uint64 lastTime, uint64 currentTime, float frequency);