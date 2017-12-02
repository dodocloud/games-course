#include "ScriptManager.h"
#include "ofLog.h"
#undef None // LuaBridge is polluting Ubuntu's global namespace
#include <LuaBridge.h>
#include "lua.h"
#include "lualib.h"
#include "lauxlib.h"
#include "Transform.h"
#include "Vec2i.h"
#include "ofImage.h"
#include "Renderable.h"
#include "ComponentLua.h"
#include "GameObject.h"
#include "Scene.h"
#include "Dynamics.h"
#include "AphUtils.h"

using namespace luabridge;
using namespace std;

luabridge::lua_State* L;

ScriptManager* ScriptManager::_instance = nullptr;

void ScriptManager::Init() {
	L = luaL_newstate();
	luaL_openlibs(L);

	InitLuaMapping();
	LoadAllScripts();
}

ComponentLua* ScriptManager::CreateLuaComponent(string name) {

	if (componentPrototypes.find(name) == componentPrototypes.end()) {
		return nullptr;
	}

	// get reference to the component prototype
	int reference = componentPrototypes.find(name)->second;

	// get the prototype
	lua_rawgeti(L, LUA_REGISTRYINDEX, reference);
	LuaRef ref = LuaRef::fromStack(L, lua_gettop(L));

	if(ref.isNil()) {
		ofLogError("Lua", "Wrong lua object; expected reference");
	}

	// call NewCpp function in Lua component
	auto newCpp = ref["NewCpp"];
	if(newCpp.isNil()) {
		ofLogError("Lua", "Wrong lua object; expected reference to method NewCpp");
	}
	
	auto compLua = new ComponentLua();

	// invoke Component.NewCpp(self, compLua);
	newCpp(ref, compLua);

	return compLua;
}

int ScriptManager::RegisterComponentPrototypeCtInternal(lua_State* L) {
	if(lua_gettop(L) != 2) {
		ofLogError("Lua", "Wrong registration call! Expected two parameters: registered object and its name");
	}
	
	// get component name and register this object
	string name = lua_tostring(L, 2);

	// remove string parameter and save only the object
	lua_pop(L, 1);

	int r = luaL_ref(L, LUA_REGISTRYINDEX);

	// store reference
	componentPrototypes[name] = r;
	return 0; // number of return values
}

void ScriptManager::LoadScript(ofFile file) {

	string name = file.getFileName();

	ofLogNotice("Lua", "Loading script %s", name.c_str());

	int status = luaL_loadfile(L, file.getAbsolutePath().c_str());

	if (status != 0) {
		ofLogError("Lua", lua_tostring(L, -1));
	}
	else {
		// run script
		status = lua_pcall(L, 0, LUA_MULTRET, 0);
		if (status != 0) {
			ofLogError("Lua", lua_tostring(L, -1));
		}
	}
}

void ScriptManager::LoadScript(string str) {

	ofLogNotice("Lua", "Loading script from string");

	int status = luaL_loadstring(L, str.c_str());
	if (status != 0) {
		ofLogError("Lua", lua_tostring(L, -1));
	}
	else {
		// execute program
		status = lua_pcall(L, 0, LUA_MULTRET, 0);
		if (status != 0) {
			ofLogError("Lua", lua_tostring(L, -1));
		}
	}
}

void ScriptManager::InitLuaMapping() {

	// static functions
	luabridge::getGlobalNamespace(L)
		.addFunction("ofRandom", static_cast<float(*)(float, float)>(&ofRandom))
		.addFunction("floor", static_cast<double(*)(double)>(&floor))
		.addFunction("CheckTime", &CheckTimeUnsigned)
		.addFunction("Modulo", &Modulo)
		.addCFunction("RegisterComponentPrototype", &RegisterComponentPrototypeCt);

	// ofVec2f
	luabridge::getGlobalNamespace(L)
		.beginClass<ofVec2f>("ofVec2f")
		.addConstructor<void(*)(float, float)>()
		.addFunction("__add", static_cast<ofVec2f(ofVec2f::*)(const ofVec2f &)const>(&ofVec2f::operator+))
		.addFunction("__mul", static_cast<ofVec2f(ofVec2f::*)(const ofVec2f &)const>(&ofVec2f::operator*))
		.addFunction("__eq", static_cast<bool(ofVec2f::*)(const ofVec2f &)const>(&ofVec2f::operator==))
		.addData("x", &ofVec2f::x)
		.addData("y", &ofVec2f::y)
		.addFunction("length", &ofVec2f::length)
		.endClass();

	// ofVec3f
	luabridge::getGlobalNamespace(L)
		.beginClass<ofVec3f>("ofVec3f")
		.addConstructor<void(*)(float, float, float)>()
		.addFunction("__add", static_cast<ofVec3f(ofVec3f::*)(const ofVec3f &)const>(&ofVec3f::operator+))
		.addFunction("__mul", static_cast<ofVec3f(ofVec3f::*)(const ofVec3f &)const>(&ofVec3f::operator*))
		.addFunction("__eq", static_cast<bool(ofVec3f::*)(const ofVec3f &)const>(&ofVec3f::operator==))
		.addData("x", &ofVec3f::x)
		.addData("y", &ofVec3f::y)
		.addData("z", &ofVec3f::z)
		.addFunction("length", &ofVec3f::length)
		.endClass();


	// Renderable 
	luabridge::getGlobalNamespace(L)
		.beginClass<Renderable>("Renderable")
		.addFunction("GetTransform", &Renderable::GetTransform)
		.endClass();

	// Image mesh
	luabridge::getGlobalNamespace(L)
		.deriveClass<ImageMesh, Renderable>("Image")
		.addFunction("GetHeight", &ImageMesh::GetHeight)
		.addFunction("GetWidth", &ImageMesh::GetWidth)
		.endClass();

	// ofImage
	luabridge::getGlobalNamespace(L)
		.beginClass<ofImage>("ofImage")
		.addFunction("getWidth", &ofImage::getWidth)
		.addFunction("getHeigt", &ofImage::getHeight)
		.endClass();

	// Text mesh 
	luabridge::getGlobalNamespace(L)
		.deriveClass<Text, Renderable>("Text")
		.addProperty("text", &Text::GetText, &Text::SetText)
		.endClass();

	// Sprite
	luabridge::getGlobalNamespace(L)
		.beginClass<Sprite>("Sprite")
		.addProperty("frame", &Sprite::GetFrame, &Sprite::SetFrame)
		.addProperty("offsetX", &Sprite::GetOffsetX)
		.addProperty("offsetY", &Sprite::GetOffsetY)
		.addProperty("width", &Sprite::GetWidth)
		.addProperty("height", &Sprite::GetHeight)
		.addFunction("GetTransform", &Sprite::GetTransform)
		.endClass();

	// Sprite mesh 
	luabridge::getGlobalNamespace(L)
		.deriveClass<SpriteMesh, Renderable>("Sprite")
		.addFunction("GetLayerName", &SpriteMesh::GetLayerName)
		.addFunction("GetSprite", &SpriteMesh::GetSprite)
	.endClass();


	// Vec2i
	luabridge::getGlobalNamespace(L)
		.beginClass<Vec2i>("Vec2i")
		.addConstructor<void(*)(int, int)>()
		.addData("x", &Vec2i::x)
		.addData("y", &Vec2i::y)
		.addFunction("__add", static_cast<Vec2i(Vec2i::*)(const Vec2i &)const>(&Vec2i::operator+))
		.addFunction("__eq", static_cast<bool(Vec2i::*)(const Vec2i &)const>(&Vec2i::operator==))
		.endClass();

	// Movement
	luabridge::getGlobalNamespace(L)
		.beginClass<Dynamics>("Dynamics")
		.addFunction("GetAcceleration", &Dynamics::GetAcceleration)
		.addFunction("SetAcceleration", &Dynamics::SetAcceleration)
		.addFunction("GetVelocity", &Dynamics::GetVelocity)
		.addFunction("SetVelocity", &Dynamics::SetVelocity)
		.addProperty("angularSpeed", &Dynamics::GetAngularSpeed, &Dynamics::SetAngularSpeed)
		.endClass();


	// Trans
	luabridge::getGlobalNamespace(L)
		.beginClass<Trans>("Trans")
		.addConstructor <void(*) (void)>()
		.addData("absPos", &Trans::absPos)
		.addData("absRotation", &Trans::absRotation)
		.addData("absRotationCentroid", &Trans::absRotationCentroid)
		.addData("absScale", &Trans::absScale)
		.addData("localPos", &Trans::localPos)
		.addData("rotation", &Trans::rotation)
		.addData("rotationCentroid", &Trans::rotationCentroid)
		.addData("scale", &Trans::scale)
		.addData("absPos", &Trans::absPos)
		.addFunction("SetAbsAsLocal", &Trans::SetAbsAsLocal)
		.addFunction("CalcAbsTransform", &Trans::CalcAbsTransform)
		.addFunction("CalcAngle", &Trans::CalcAngle)
		.addFunction("SetRotationAsAngleToPosition", &Trans::SetRotationAsAngleToPosition)
		.endClass();


	// StrId
	luabridge::getGlobalNamespace(L)
		.beginClass<StrId>("StrId")
		.addConstructor<void(*)(string)>()
		.addFunction("GetValue", &StrId::GetValue)
		.addFunction("__eq", static_cast<bool(StrId::*)(const StrId &)const>(&StrId::operator==))
		.endClass();

	// Msg
	luabridge::getGlobalNamespace(L)
		.beginClass<Msg>("Msg")
		.addConstructor<void(*)()>()
		.addFunction("GetAction", &Msg::GetAction)
		.addFunction("GetSenderId", &Msg::GetSenderId)
		.endClass();


	// Component
	luabridge::getGlobalNamespace(L)
		.beginClass<Component>("Component")
		.addFunction("RegisterSubscriber", &Component::RegisterSubscriber)
		.addFunction<void(Component::*)(StrId)>("SendMsg", &Component::SendMsg)
		.addFunction("GetScene", &Component::GetScene)
		.addData("owner", &Component::owner)
		.endClass();

	luabridge::getGlobalNamespace(L)
		.deriveClass<ComponentLua, Component>("ComponentLua")
		.addConstructor<void(*)(void)>()
		.addCFunction("RegisterDelegate", &ComponentLua::RegisterDelegateCt)
		.endClass();

	// GameObject
	luabridge::getGlobalNamespace(L)
		.beginClass<GameObject>("GameObject")
		.addProperty("name", &GameObject::GetName, &GameObject::SetName)
		.addProperty("transform", &GameObject::GetTransform, &GameObject::SetTransform)
		.addProperty("parent", &GameObject::GetParent)
		.addProperty("root", &GameObject::GetRoot)
		.addFunction("Remove", &GameObject::Remove)
		.addProperty("scene", &GameObject::GetScene)
		.addFunction("HasAttr", &GameObject::HasAttr)
		.addFunction("RemoveAttr", &GameObject::RemoveAttr)
		.addFunction("AddAttrString", &GameObject::AddAttrString)
		.addFunction("AddAttrInt", &GameObject::AddAttrInt)
		.addFunction("AddAttrFloat", &GameObject::AddAttrFloat)
		.addFunction("AddAttrVector2f", &GameObject::AddAttrVector2f)
		.addFunction("AddAttrVector3f", &GameObject::AddAttrVector3f)
		.addFunction("AddAttrVec2i", &GameObject::AddAttrVec2i)
		.addFunction("AddAttrPtr", &GameObject::AddAttrPtr)
		.addFunction("GetAttrString", &GameObject::GetAttrString)
		.addFunction("GetAttrInt", &GameObject::GetAttrInt)
		.addFunction("GetAttrFloat", &GameObject::GetAttrFloat)
		.addFunction("GetAttrVector2f", &GameObject::GetAttrVector2f)
		.addFunction("GetAttrVector3f", &GameObject::GetAttrVector3f)
		.addFunction("GetAttrVec2i", &GameObject::GetAttrVec2i)
		.addFunction("GetRenderable", reinterpret_cast<Renderable*(GameObject::*)() const> (&GameObject::GetRenderable))
		.addFunction("GetImageMesh", reinterpret_cast<ImageMesh*(GameObject::*)() const> (&GameObject::GetRenderable))
		.addFunction("GetSpriteMesh", reinterpret_cast<SpriteMesh*(GameObject::*)() const> (&GameObject::GetRenderable))
		.addFunction("GetText", reinterpret_cast<Text*(GameObject::*)() const> (&GameObject::GetRenderable))
		.endClass();

	// Scene
	luabridge::getGlobalNamespace(L)
		.beginClass<Scene>("Scene")
		.addFunction("GetRootObject", &Scene::GetRootObject)
		.addFunction("FindGameObjectByName", &Scene::FindGameObjectByName)
		.addFunction("GetName", &Scene::GetName)
		.endClass();
}

void ScriptManager::LoadAllScripts() {

	ofDirectory dir(ofToDataPath(SCRIPTS_PATH));

	if (dir.exists()) {
		auto files = dir.getFiles();

		// first of all, load base.lua. It must be loaded first
		for (auto file : files) {
			if (file.getFileName() == "base.lua") {
				LoadScript(file);
			}
		}

		// load the rest
		for (auto file : files) {
			if (file.getFileName() != "base.lua") {
				LoadScript(file);
			}
		}
	}else {
		ofLogError("Lua", "Directory %s not found!", SCRIPTS_PATH);
	}
}
