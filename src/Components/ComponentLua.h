#pragma once

#include "Msg.h"
#include "Component.h"


namespace luabridge {
	struct lua_State;
}

/**
 * Proxy class for components that are written in Lua
 */
class ComponentLua : public Component {
private:
	int reference = 0; // reference ID of Lua component
	luabridge::lua_State* L;
public:

	ComponentLua();

	void Init();

	/**
	 * Function that is called from Lua script
	 * Registers a new Lua component
	 */
	int RegisterDelegateCt(luabridge::lua_State* L);

	virtual void OnMessage(Msg& msg);

	void SendMsgWithData(StrId action, void* data);

	virtual void Update(const uint64_t delta, const uint64_t absolute);

protected:
	void SetOwnerLua();
};