#include "ComponentLua.h"
#undef None // LuaBridge is polluting Ubuntu's global namespace
#include <LuaBridge.h>

using namespace luabridge;

#include "GameObject.h"
#include "ScriptManager.h"

ComponentLua::ComponentLua() {
	this->isScriptComponent = true;
	auto scr = ScriptManager::GetInstance();
	L = scr->GetLua();
	scr->StoreComponent(this);
}

void ComponentLua::Init() {
	// pass owner GameObject into Lua script
	SetOwnerLua();

	// get Lua component
	lua_rawgeti(L, LUA_REGISTRYINDEX, reference);
	LuaRef ref = LuaRef::fromStack(L, lua_gettop(L));
	
	if(ref.isNil()) {
		ofLogError("Lua", "Wrong lua object; expected reference!");
	}

	// call Init function
	auto init = ref["Init"];
	if (ref.isNil()) {
		ofLogError("Lua", "Wrong lua object; expected reference!");
	}

	init(ref);
}

int ComponentLua::RegisterDelegateCt(luabridge::lua_State* L) {
	
	if(lua_gettop(L) != 2) {
		ofLogError("Lua", "Wrong registration call! Expected one parameter: a registered object!");
	}
	
	// get reference from Lua stack
	int r = luaL_ref(L, LUA_REGISTRYINDEX);
	lua_rawgeti(L, LUA_REGISTRYINDEX, r);
	this->reference = r;
	return 0; // number of return values
}

void ComponentLua::OnMessage(Msg& msg) {
	lua_rawgeti(L, LUA_REGISTRYINDEX, reference);
	LuaRef ref = LuaRef::fromStack(L, lua_gettop(L));
	if (ref.isNil()) {
		ofLogError("Lua", "Wrong lua object; expected reference!");
	}
	auto method = ref["OnMessage"];
	if (method.isNil()) {
		ofLogError("Lua", "Wrong lua object; expected method OnMessage!");
	}

	method(ref, msg);
}

void ComponentLua::Update(const uint64_t delta, const uint64_t absolute) {
	lua_rawgeti(L, LUA_REGISTRYINDEX, reference);
	LuaRef ref = LuaRef::fromStack(L, lua_gettop(L));

	if (ref.isNil()) {
		ofLogError("Lua", "Wrong lua object; expected reference!");
	}
	auto method = ref["Update"];
	if (method.isNil()) {
		ofLogError("Lua", "Wrong lua object; expected method Update!");
	}

	// uint64_t doesn't work here 
	method(ref, (unsigned)delta, (unsigned)absolute);
}

void ComponentLua::SetOwnerLua() {
	lua_rawgeti(L, LUA_REGISTRYINDEX, reference);
	LuaRef ref = LuaRef::fromStack(L, lua_gettop(L));
	if (ref.isNil()) {
		ofLogError("Lua", "Wrong lua object; expected reference!");
	}
	auto ownerLua = ref["owner"];
	ownerLua.rawset(owner);
}
