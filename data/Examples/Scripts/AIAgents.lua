
----------------------------------------------------------------------------------

WarehouseComponent = Component:Extend("WarehouseComponent")

function WarehouseComponent:Init()
  self.model = self.owner:GetAttr_AIMODEL() 
end


function WarehouseComponent:Update(delta, absolute)
  local model = self.model
  local wmodel = model:GetWarehouseModel();
  
  if(wmodel.isBuilding) then
    wmodel.currentBuildTime = wmodel.currentBuildTime + delta

	if(wmodel.currentBuildTime >= wmodel.buildDelay) then
	  wmodel.currentBuildTime = 0
	  wmodel.isBuilding = false
	  wmodel.ironOre = wmodel.ironOre - wmodel.agentIronCost
	  wmodel.petrol = wmodel.petrol - wmodel.agentPetrolCost
	  model.agentsNum = model.agentsNum + 1
	  AIAgentsFactory.CreateAgent(self.owner.root, model, wmodel.position, true)
	end
  elseif(wmodel.ironOre >= wmodel.agentIronCost and wmodel.petrol >= wmodel.agentPetrolCost) then
    wmodel.isBuilding = true
  end
end


----------------------------------------------------------------------------------

WarehouseStateComponent = Component:Extend("WarehouseStateComponent")

function WarehouseStateComponent:Init()
  self.model = self.owner.root:GetAttr_AIMODEL()
end

function WarehouseStateComponent:Update(delta, absolute)

  local mesh = self.owner:GetText()
  local percentage = 0
  local wmodel = self.model:GetWarehouseModel()
  if(wmodel.isBuilding) then
    percentage = wmodel.currentBuildTime / wmodel.buildDelay * 100.0
  end
  
  mesh.text = (string.format("IRON: %d\nPETROL: %d\nBUILDING: %d%%\nAGENTS: %d", wmodel.ironOre, wmodel.petrol, percentage, self.model.agentsNum))
end
----------------------------------------------------------------------------------

AGENT_STATE_IDLE = 0
AGENT_STATE_GOING_TO_LOAD = 1
AGENT_STATE_GOING_TO_UNLOAD = 2
AGENT_STATE_LOADING = 3
AGENT_STATE_UNLOADING = 4

AGENT_TYPE_RED = 1
AGENT_TYPE_BLUE = 2

CARGO_TYPE_ORE = 1
CARGO_TYPE_PETROL = 2


MAP_BLOCK_PATH = 0
MAP_BLOCK_WALL = 1
MAP_BLOCK_WAREHOUSE = 2
MAP_BLOCK_ORE = 3
MAP_BLOCK_PETROL = 4
AIMAP_WIDTH = 10
AIMAP_HEIGHT = 10



----------------------------------------------------------------------------------

AgentAnimComponent = Component:Extend("AgentAnimComponent")

function AgentAnimComponent:Init()
  self.changeFrequency = 10
  self.lastSwitchTime = 0
  self.model = self.owner:GetAttr_AGENTMODEL()
  self.dynamics = self.owner:GetAttr_DYNAMICS()
end

function AgentAnimComponent:Update(delta, absolute)
  local velocity = self.dynamics:GetVelocity()
  local mesh = self.owner:GetSpriteMesh()
  local sprite = mesh:GetSprite()

  if(velocity:length() < 1) then
    if(self.model.agentType == AGENT_TYPE_BLUE) then
	  sprite.frame = 0
	else
	  sprite.frame = 4
	end
  else
    if(CheckTime(self.lastSwitchTime, absolute, self.changeFrequency)) then
	  if(self.model.agentType == AGENT_TYPE_BLUE) then
	    sprite.frame = Modulo(1, 3, sprite.frame)
	  else
	    sprite.frame = Modulo(5, 7, sprite.frame)
	  end
	end
  end
end

----------------------------------------------------------------------------------

AgentAIComponent  = Component:Extend("AgentAIComponent")

function AgentAIComponent:Init()
  self.gameModel = self.owner.root:GetAttr_AIMODEL()
  self.agentModel = self.owner:GetAttr_AGENTMODEL()
  self.moveComponent = self.owner:GetComponent_AgentAIMoveComponent()
  self.lastState = AGENT_STATE_IDLE
end

function AgentAIComponent:Update(delta, absolute)
  local state = self.agentModel.currentState
  local stateChange = state ~= self.lastState
  
  if(state == AGENT_STATE_IDLE) then
    state = self:ProcessIdleState(stateChange, delta, absolute)
  elseif(state == AGENT_STATE_GOING_TO_LOAD) then
	state = self:ProcessGoingToLoadState(stateChange, delta, absolute)
  elseif(state == AGENT_STATE_GOING_TO_UNLOAD) then
	state = self:ProcessGoingToUnloadState(stateChange, delta, absolute)
  elseif(state == AGENT_STATE_LOADING) then
	state = self:ProcessLoadingState(stateChange, delta, absolute)
  elseif(state == AGENT_STATE_UNLOADING) then
	state = self:ProcessUnloadingState(stateChange, delta, absolute)
  end
  self.lastState = self.agentModel.currentState
  self.agentModel.currentState = state
end

function AgentAIComponent:ProcessIdleState(isEntering, delta, absolute)
  if(self.agentModel:IsLoaded()) then
    return AGENT_STATE_GOING_TO_UNLOAD
  else
    return AGENT_STATE_GOING_TO_LOAD
  end
end

function AgentAIComponent:ProcessGoingToLoadState(isEntering, delta, absolute)
  if(self.agentModel:IsLoaded()) then
    return AGENT_STATE_GOING_TO_UNLOAD
  end

  if(isEntering) then
    self:GoLoad()
	return AGENT_STATE_GOING_TO_LOAD
  end
  if(self.moveComponent:PathFinished()) then
    return AGENT_STATE_LOADING
  else
    return AGENT_STATE_GOING_TO_LOAD
  end
end

function AgentAIComponent:ProcessGoingToUnloadState(isEntering, delta, absolute)
  if(not self.agentModel:IsLoaded()) then
    return AGENT_STATE_GOING_TO_LOAD
  end
  
  if(isEntering) then
    self:GoUnload()
	return AGENT_STATE_GOING_TO_UNLOAD
  end
  
  if(self.moveComponent:PathFinished()) then
    return AGENT_STATE_UNLOADING
  else
    return AGENT_STATE_GOING_TO_UNLOAD
  end
end

function AgentAIComponent:ProcessLoadingState(isEntering, delta, absolute)
  local agentModel = self.agentModel
  
  if(agentModel.currentLoadingTime > agentModel.loadingDelay) then
    agentModel.currentLoadingTime = 0
	agentModel.amount = agentModel.amount + 10
	return AGENT_STATE_IDLE
  end
  
  agentModel.currentLoadingTime = agentModel.currentLoadingTime + delta
  return AGENT_STATE_LOADING
end

function AgentAIComponent:ProcessUnloadingState(isEntering, delta, absolute)
  local agentModel = self.agentModel
  local gameModel = self.gameModel
  
  if(agentModel.currentLoadingTime > agentModel.loadingDelay) then
    agentModel.currentLoadingTime = 0
  
    if(agentModel.currentCargo == CARGO_TYPE_ORE) then
      gameModel:GetWarehouseModel().ironOre = gameModel:GetWarehouseModel().ironOre  + agentModel.amount
	  gameModel.goingToLoadOre = gameModel.goingToLoadOre - 1
    elseif(agentModel.currentCargo == CARGO_TYPE_PETROL) then
      gameModel:GetWarehouseModel().petrol = gameModel:GetWarehouseModel().petrol + agentModel.amount
	  gameModel.goingToLoadPetrol = gameModel.goingToLoadPetrol - 1
    end
	
	agentModel.amount = 0
	return AGENT_STATE_IDLE
  end
  
  agentModel.currentLoadingTime = agentModel.currentLoadingTime + delta
  return AGENT_STATE_UNLOADING
end

function AgentAIComponent:GoLoad()
  local gameModel = self.gameModel
  local agentModel = self.agentModel
  
  local ores = list_mapblock();
  local petrols = list_mapblock();

  local map = gameModel:GetMap()
  map:FindAllMapBlocks(MAP_BLOCK_ORE, ores)
  map:FindAllMapBlocks(MAP_BLOCK_PETROL, petrols)

  local petrol = gameModel:GetWarehouseModel().petrol
  local ore = gameModel:GetWarehouseModel().ironOre
  local expectedPetrol = petrol + gameModel.goingToLoadPetrol * agentModel.capacity
  local expectedOre = ore + gameModel.goingToLoadOre * agentModel.capacity
  
  local expectedUnitsPetrol = expectedPetrol / gameModel:GetWarehouseModel().agentPetrolCost
  local expectedUnitsOre = expectedOre / gameModel:GetWarehouseModel() . agentIronCost
  
  local selectedTarget = 0
  
  if(expectedUnitsPetrol > expectedUnitsOre) then
    selectedTarget = ores:At(math.random(0,ores:Size()-1))
  else
    selectedTarget = petrols:At(math.random(0, petrols:Size()-1))
  end
  
  local agentLocation = self.owner:GetRenderable():GetTransform().localPos
  local agentLocation2f = ofVec2f(agentLocation.x, agentLocation.y)
  local agentMapPosition = self.gameModel:GetMap():LocationToMapBlock(agentLocation2f)
  local orePosition = Vec2i(selectedTarget.x, selectedTarget.y)

  if(selectedTarget.type == MAP_BLOCK_PETROL) then
    agentModel.currentCargo = CARGO_TYPE_PETROL
	gameModel.goingToLoadPetrol = gameModel.goingToLoadPetrol + 1
  else  
    agentModel.currentCargo = CARGO_TYPE_ORE
	gameModel.goingToLoadOre = gameModel.goingToLoadOre + 1
  end
  
  self.moveComponent:GoToPoint(agentMapPosition, agentLocation2f, orePosition)
end

function AgentAIComponent:GoUnload()
  local agentLocation = self.owner:GetRenderable():GetTransform().localPos
  local agentLocation2f = ofVec2f(agentLocation.x, agentLocation.y)
  local agentMapPosition = self.gameModel:GetMap():LocationToMapBlock(agentLocation2f)
  local warehousePosition = self.gameModel:GetMap():FindNearestMapBlock(agentMapPosition, MAP_BLOCK_WAREHOUSE)
  self.moveComponent:GoToPoint(agentMapPosition, agentLocation2f, warehousePosition)
end
