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

-- create a new component
WarehouseComponent = Component:Extend("WarehouseComponent")

function WarehouseComponent:Init()
  -- get model from game object attribute
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
	  model.agentsNum = model.agentsNum + 1 -- there is no += operator!
	  
	  -- call the factory
	  AIAgentsFactory.CreateAgent(self.owner.root, model, wmodel.position)
	end
  elseif(wmodel.ironOre >= wmodel.agentIronCost and wmodel.petrol >= wmodel.agentPetrolCost) then
    wmodel.isBuilding = true
  end
end



