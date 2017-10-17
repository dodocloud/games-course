#include "Component.h"
#include "GameObject.h"
#include "Scene.h"

int Component::idCounter = 0;

void Component::RegisterSubscriber(StrId action) {
	owner->GetScene()->RegisterSubscriber(action, this);
}

void Component::SendMsg(StrId action) {
	Msg msg(action, this->id, owner, nullptr);
	SendMsg(msg);
}

void Component::SendMsg(StrId action, void* data) {
	Msg msg(action, this->id, owner, data);
	SendMsg(msg);
}

void Component::SendMsg(Msg& msg) {
	owner->GetScene()->SendMsg(msg);
}