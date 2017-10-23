#include "Flags.h"
#include <stdarg.h>  
#include "StrId.h"

Flags::Flags() {
}

Flags::Flags(vector<unsigned>& states) {
	for (size_t i = 0; i < states.size(); i++) SetState(states[i]);
}

Flags::Flags(unsigned state) {
	SetState(state);
}

Flags::Flags(StrId state) {
	SetState(state.GetValue());
}


Flags::Flags(const Flags& obj) {
	flags1 = obj.flags1;
	flags2 = obj.flags2;
	flags3 = obj.flags3;
	flags4 = obj.flags4;

	if (obj.otherFlags != nullptr) {
		otherFlags = new map<unsigned, unsigned>();

		for (auto it = obj.otherFlags->begin(); it != obj.otherFlags->end(); ++it) {
			(*otherFlags)[it->first] = it->second;
		}
	}
}

Flags::~Flags() {
	delete otherFlags;
}

vector<unsigned> Flags::GetAllStates() const {
	vector<unsigned> output;

	// iterate over flags
	for (unsigned i = 0; i < sizeof(unsigned) * 4; i++) {
		if (HasState(i)) output.push_back(i);
	}

	// iterate over map
	if (otherFlags != nullptr) {
		for (auto it = otherFlags->begin(); it != otherFlags->end(); ++it) {
			// get value
			unsigned flag = it->second;
			if (flag != 0) {
				for (unsigned i = 0; i < sizeof(unsigned); i++) {
					unsigned st = it->first * sizeof(unsigned) + i;

					if (HasState(st)) output.push_back(st);
				}
			}
		}
	}

	return output;
}

bool Flags::HasState(unsigned state) const {
	unsigned index = GetStateIndex(state);
	unsigned offset = GetStateOffset(state);
	unsigned binary = 1 << offset;

	// check integer flags
	if (index <= 3) {
		switch (index) {
		case 0: return (flags1 & binary) == binary;
		case 1: return (flags2 & binary) == binary;
		case 2: return (flags3 & binary) == binary;
		case 3: return (flags4 & binary) == binary;
		}
	}

	// if index > 3, the state should be stored in the map
	if (otherFlags != nullptr) {
		return otherFlags->count(index) && (((*otherFlags)[index] & binary) == binary);
	}
	else return false;
}

void Flags::SwitchState(unsigned state1, unsigned state2) {
	bool hasState2 = HasState(state2);

	if (HasState(state1)) SetState(state2);
	else ResetState(state2);

	if (hasState2) SetState(state1);
	else ResetState(state1);
}

Flags& Flags::operator=(const unsigned& st1) {
	delete otherFlags;
	flags1 = flags2 = flags3 = flags4 = 0;
	otherFlags = nullptr;

	SetState(st1);
	return *this;
}

Flags& Flags::operator=(const Flags& st1) {
	flags1 = st1.flags1;
	flags2 = st1.flags2;
	flags3 = st1.flags3;
	flags4 = st1.flags4;

	delete otherFlags;

	if (st1.otherFlags != nullptr) {
		(*otherFlags) = (*st1.otherFlags);
	}
	return *this;
}

bool Flags::operator==(unsigned st2) {
	return HasState(st2);
}

bool Flags::operator==(const Flags& st2) {
	if (otherFlags != nullptr) {
		// compare map
		if (st2.otherFlags == nullptr || otherFlags->size() != st2.otherFlags->size()) return false;

		for (auto iter = otherFlags->begin(); iter != otherFlags->end(); ++iter) {
			unsigned key = iter->first;
			unsigned value = iter->second;
			if ((*st2.otherFlags)[key] != value) return false;
		}
	}

	// compare integer flags
	return flags1 == st2.flags1 && flags2 == st2.flags2 && flags3 == st2.flags3 && flags4 == st2.flags4;
}

bool Flags::operator!=(unsigned st1) {
	return !(*this == st1);
}

bool Flags::operator!=(const Flags& st1) {
	return !(*this == st1);
}

Flags Flags::operator+(unsigned st1) {
	Flags copy(*this);
	copy.SetState(st1);
	return copy;
}

Flags Flags::operator-(unsigned st1) {
	Flags copy(*this);
	copy.ResetState(st1);
	return copy;
}

Flags& Flags::operator+=(unsigned st1) {
	SetState(st1);
	return *this;
}

Flags& Flags::operator-=(unsigned st1) {
	ResetState(st1);
	return *this;
}

bool Flags::Contains(Flags& other) const {
	// return first false
	vector<unsigned> allStates = other.GetAllStates();
	for (size_t i = 0; i < allStates.size(); i++) {
		if (!HasState(allStates[i])) return false;
	}
	return true;
}

bool Flags::ContainsAtLeastOne(Flags& other) const {
	// return first true
	vector<unsigned> allStates = other.GetAllStates();
	for (size_t i = 0; i < allStates.size(); i++) {
		if (HasState(allStates[i])) return true;
	}
	return false;
}

void Flags::DoStateOperation(bool set, unsigned state) {
	unsigned index = GetStateIndex(state);
	unsigned offset = GetStateOffset(state);
	unsigned binary = 1 << offset;

	// set integer flags
	if (index <= 3) {
		switch (index) {
		case 0:  if (set)  (flags1 |= binary); else (flags1 ^= binary);
			return;
		case 1:  if (set) (flags2 |= binary); else (flags2 ^= binary);
			return;
		case 2:  if (set) (flags3 |= binary); else (flags3 ^= binary);
			return;
		case 3:  if (set) (flags4 |= binary); else (flags4 ^= binary);
			return;
		}
	}

	// if index > 3, the state will be stored in the map
	if (otherFlags == nullptr) otherFlags = new map<unsigned, unsigned>();

	if (set) {
		if (!otherFlags->count(index)) {
			(*otherFlags)[index] = binary;
		}
		else (*otherFlags)[index] |= binary;
	}
	else {
		if (otherFlags->count(index)) {
			(*otherFlags)[index] ^= binary;
			// must be, because there can't be any null value
			if (((*otherFlags)[index]) == 0) otherFlags->erase(index);
		}
	}
}