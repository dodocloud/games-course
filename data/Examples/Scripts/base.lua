--[[

this class is created in CPP via LuaBridge and serves as a proxy class that keeps 
a reference to the Component table created in Lua in order to call its functions,
such as Init, OnMessage and Update

ComponentLua = {
  RegisterSubscriber = function() end,
  RegisterDelegate = function() end,
  SendMsg = function() end,
  GetScene = function() end,
  owner = {}
}
]]

-- create component base object
Component = {
	-- function for creating instances from C++ code
	NewCpp = function(self, componentLua) -- componentLua is a proxy class that only keeps a reference to this component
		local meta = self:CreateMeta() -- create metatable
		self:Constructor() -- call the constructor
		componentLua:RegisterDelegate(meta) -- 
		meta.proxy = componentLua
		return meta
	end,
	-- function for creating instances from Lua code
	New = function(self, ...)
		local meta = self:CreateMeta()
		self:Constructor(...)
		local componentLua = ComponentLua() -- we have to create proxy class from Lua
		componentLua:RegisterDelegate(meta)
		meta.proxy = componentLua
		return meta
	end,
	-- function that simulates inheritance, returns prototype of a new component
	-- note that Extend creates prototypes, New/NewCpp creates instances of that prototype!
	-- @param self - parent class (Component by default)
	-- @param classname - name of a new class
	-- @param subtype - child class
	-- usage: MyNewComponent = Component:Extend("MyNewComponent")
	Extend = function(self, classname, subtype)
		if (subtype) then
            -- copy methods into subtype
			subtype.NewCpp = self.NewCpp -- override
			subtype.New = self.New -- override
			subtype.Extend = self.Extend -- override
			subtype.CreateMeta = self.CreateMeta -- override
			subtype.Constructor = subtype.Constructor or self.Constructor -- keep if already defined
			subtype.Init = subtype.Init or self.Init -- keep if already defined
			subtype.OnMessage = subtype.OnMessage or self.OnMessage -- keep if already defined
			subtype.Update = subtype.Update or self.Update -- keep if already defined
			subtype.RegisterSubscriber = self.RegisterSubscriber -- override
			subtype.SendMsg = self.SendMsg -- override
			subtype.SendMsgWithData = self.SendMsgWithData -- override
		else
			subtype = self -- no subtype specified
		end

		if not(classname) or classname == "" then error("When called Extend(classname), a name of the new class must be specified") end

		-- create metatable
		local meta = subtype:CreateMeta()
		meta.classname = classname
		-- call static method that registers a new prototype
		RegisterComponentPrototype(meta, classname)
		return meta
	end,
	
	-- creates metatable 
	CreateMeta = function(self)
		-- create this metatable over an empty table since all we only need to override __call function
		output = setmetatable( { }, {
			__index = self,
			-- by overriding __call, we can then create new instances using "Component()" besides "Component:new()"
			__call = function(self, ...)
				return self:New(...)
			end
		} )

		return output
	end,
	-- virtual methods
	Constructor = function(self, ...) end,
	Init = function(self) end,
	OnMessage = function(self, msg) end,
	Update = function(self, delta, absolute) end,
	-- methods that will call assigned proxy object
	RegisterSubscriber = function(self, act) if(type(act) == "string") then act = StrId(act) end return self.proxy:RegisterSubscriber(act) end,
	SendMsg = function(self, msg) if(type(msg) == "string") then return self.proxy:SendMsg(StrId(msg)) else return self.proxy:SendMsg(msg) end end,
	SendMsgWithData = function(self, msg, data) if(type(msg) == "string") then return self.proxy:SendMsgWithData(StrId(msg), data) else return self.proxy:SendMsgWithData(msg, data) end end
}


