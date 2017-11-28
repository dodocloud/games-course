#pragma once

#include <vector>
#include <map>

#define SCRIPTS_PATH "Examples/Scripts"

using namespace std;

#include "StrId.h"

namespace luabridge {
	struct lua_State;
}

class ComponentLua;

/**
 * Manager for Lua components and their prototypes
 */
class ScriptManager {

private:
	static ScriptManager* _instance;

	luabridge::lua_State* L;
	// lua behaviors
	vector<ComponentLua*> components;
	// references to component prototypes
	map<string, int> componentPrototypes;

	ScriptManager() {
		
	}
public:

	static ScriptManager* GetInstance() {
		if(_instance == nullptr) {
			_instance = new ScriptManager();
		}
		return _instance;
	}



	void Init();

	/**
	* Gets pointer to luabridge system
	*/
	luabridge::lua_State* GetLua() {
		return L;
	}

	/**
	* Gets collection of registered lua components
	*/
	vector<ComponentLua*>& GetComponents() {
		return components;
	}

	/**
	* Stores created lua component proxy into collection
	*/
	void StoreComponent(ComponentLua* cmp) {
		this->components.push_back(cmp);
	}

	/**
	* Creates a new instance of lua component based on its name
	*/
	ComponentLua* CreateLuaComponent(string name);

	
	/**
	 * Registers component prototype that is called from Extend() function
	 */
	static int RegisterComponentPrototypeCt(luabridge::lua_State* L) {
		return _instance->RegisterComponentPrototypeCtInternal(L);
	}

	/**
	 * Loads a script from file
	 */
	void LoadScript(ofFile file);

	/**
	 * Loads a script from path
	 */
	void LoadScript(string str);

	/**
	 * Loads all scripts from SCRIPTS_PATH
	 */
	void LoadAllScripts();

	/**
	 * Initializes Lua mapping functions
	 */
	void InitLuaMapping();

protected:
	int RegisterComponentPrototypeCtInternal(luabridge::lua_State* L);
};
