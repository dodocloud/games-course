
----------------------------------------------------------------------------------

FILE_SOUND_HIT =  "Examples/arkanoid/hit.wav"
FILE_SOUND_ROUND = "Examples/arkanoid/round.mp3"
FILE_SOUND_GAME_OVER = "Examples/arkanoid/gameover.mp3"
FILE_SOUND_GAME_START = "Examples/arkanoid/intro.mp3"

HIT_TYPE_BORDER = 0
HIT_TYPE_PADDLE = 1
HIT_TYPE_BLOCK = 2

ARK_BRICK_NONE = 0
ARK_BRICK_1 = 1
ARK_BRICK_2 = 2
ARK_BRICK_3 = 3
ARK_BRICK_4 = 4
ARK_BRICK_5 = 5
ARK_BRICK_6 = 6

ARK_BRICK_INDESTRUCTIBLE = ARK_BRICK_1

----------------------------------------------------------------------------------


ArkanoidSoundComponent = Component:Extend("ArkanoidSoundComponent")

function ArkanoidSoundComponent:Init()
  self:RegisterSubscriber("ARK_EVENT_GAME_STARTED");
  self:RegisterSubscriber("ARK_EVENT_ROUND_STARTED");
  self:RegisterSubscriber("ARK_EVENT_OBJECT_HIT");
  self:RegisterSubscriber("ARK_EVENT_GAME_OVER");
  self:RegisterSubscriber("ARK_EVENT_LEVEL_COMPLETED");
  self:RegisterSubscriber("ARK_EVENT_LEVEL_STARTED");
  self:RegisterSubscriber("ARK_EVENT_GAME_COMPLETED");
end

function ArkanoidSoundComponent:OnMessage(msg)
  if(msg:GetAction() == StrId("ARK_EVENT_ROUND_STARTED")) then self.owner:GetContext():PlaySound(FILE_SOUND_ROUND)
  elseif(msg:GetAction() == StrId("ARK_EVENT_OBJECT_HIT")) then self.owner:GetContext():PlaySound(FILE_SOUND_HIT)
  elseif(msg:GetAction() == StrId("ARK_EVENT_GAME_OVER")) then self.owner:GetContext():PlaySound(FILE_SOUND_GAME_OVER)
  elseif(msg:GetAction() == StrId("ARK_EVENT_LEVEL_COMPLETED")) then self.owner:GetContext():PlaySound(FILE_SOUND_GAME_OVER)
  elseif(msg:GetAction() == StrId("ARK_EVENT_LEVEL_STARTED")) then self.owner:GetContext():PlaySound(FILE_SOUND_ROUND)
  elseif(msg:GetAction() == StrId("ARK_EVENT_GAME_STARTED")) then self.owner:GetContext():PlaySound(FILE_SOUND_GAME_START)
  elseif(msg:GetAction() == StrId("ARK_EVENT_GAME_COMPLETED")) then  self.owner:GetContext():PlaySound(FILE_SOUND_GAME_OVER) end
end

----------------------------------------------------------------------------------

ArkanoidIntroComponent = Component:Extend("ArkanoidIntroComponent")

function ArkanoidIntroComponent:Init()
  self.introShowDelay = 5000
  self.introShowTime = 0
  self.model = self.owner:GetRoot():GetAttr_ARKANOID_MODEL()
  self:SendMsg("ARK_EVENT_GAME_STARTED")
end

function ArkanoidIntroComponent:Update(delta, absolute)
  self.introShowTime = self.introShowTime + delta
  
  if(self.introShowTime > self.introShowDelay) then
    self.model.currentLevel = 1
	self.owner:GetContext():ResetGame()
  end
end

----------------------------------------------------------------------------------

