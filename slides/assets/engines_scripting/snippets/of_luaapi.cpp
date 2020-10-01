 // ofvec2f 2D vectors mapping via luabridge library
luabridge::getGlobalNamespace(L)
  .beginClass<ofVec2f>("ofVec2f")
  .addConstructor<void(*)(float, float)>()
  .addFunction(LUA_OPERATOR_PLUS, 
      static_cast<ofVec2f(ofVec2f::*)(const ofVec2f &)const>(&ofVec2f::operator+))
  .addFunction(LUA_OPERATOR_MULT, 
      static_cast<ofVec2f(ofVec2f::*)(const ofVec2f &)const>(&ofVec2f::operator*))
  .addFunction(LUA_OPERATOR_EQ, 
      static_cast<bool(ofVec2f::*)(const ofVec2f &)const>(&ofVec2f::operator==))
  .addData("x", &ofVec2f::x)
  .addData("y", &ofVec2f::y)
  .addFunction("length", &ofVec2f::length)
  .addFunction("dot", &ofVec2f::dot)
  .endClass();