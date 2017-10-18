#include "PacmanApp.h"
#include "AphUtils.h"
#include "SpriteSheetBuilder.h"
#include "MapLoader.h"

//--------------------------------------------------------------
void PacmanApp::setup() {
	if (CheckAPHVersion()) {

		ofSetFrameRate(60);
		virtualAspectRatio = ((float)ofGetWindowSize().x) / ofGetWindowSize().y;

		// initialize renderer
		renderer = new Renderer();
		renderer->OnInit();

		// load sprite sheets
		spritesImage = new ofImage("Pacman/sprites.png");
		mapImage = new ofImage("Pacman/map.png");

		// initialize virtual size
		windowResized(ofGetWindowSize().x, ofGetWindowSize().y);

		// add two layers into renderer - sprites and background
		renderer->AddTileLayer(spritesImage, "spriteLayer", 1000, 1);
		renderer->AddTileLayer(mapImage, "bgrLayer", 1, 2);

		// initialize all sprites
		sprites.Initialize(mapImage, spritesImage);

		// add all meshes into separate collection for rendering
		meshes.push_back(sprites.background);
		meshes.push_back(sprites.staticMesh);
		meshes.push_back(sprites.dotMesh);
		meshes.push_back(sprites.pelletMesh);
		meshes.push_back(sprites.spiderMesh);
		meshes.push_back(sprites.textMesh);


		// set location of the score text at [12,0] cell
		auto textPos = MapToWorld(12, 0);
		auto textTrans = Trans(textPos.x, textPos.y, 50);
		textTrans.scale = ofVec3f(0.35f); // scale a little bit
		sprites.textMesh->SetTransform(textTrans);

		// assign sprite to the player
		player.sprite = sprites.player;
		
		// load map structure
		MapLoader().LoadMap("Pacman/map.txt", tileMap);

		// initialize the game
		ResetGame();
	}
}

void PacmanApp::ResetGame() {
	dotsAndPellets.clear();
	isRushMode = false;
	spiders.clear();
	sprites.Reset();
	remainingDots = 0;
	player.state = STATE_NONE;

	// load objects
	for (int i = 0; i < gridWidth; i++) {
		for (int j = 0; j < gridHeight; j++) {

			auto& tile = tileMap.GetTile(i, j);
			int index = j*gridWidth + i;

			// insert dots and pellets to all free blocks
			if (tile.IsFree()) {
				dotsAndPellets.insert(index);
				auto trans = Trans(MapToWorld(i + 0.5f, j + 0.5f)); // should be in the center of each block

				if (tile.specialFunction == FUNCTION_BONUS) {
					// add pellet entity
					sprites.AddPellet(trans, index);
				}
				else {
					// add dot entity
					sprites.AddPacDot(trans, index);
					remainingDots++;
				}
			}
			else if (tile.specialFunction == FUNCTION_PACMAN_SPAWN) {
				// this is the place where the player starts
				player.posX = tile.x + 0.5f;
				player.posY = tile.y + 0.5f;
			}
		}
	}
}


bool PacmanApp::CheckTunnel(GameUnit& unit, MovementInfo& info) {
	
	// tunnel check
	if (info.isInCenter && tileMap.GetTile(info.intPartX, info.intPartY).specialFunction == FUNCTION_TUNNEL) {
		// teleport to the next tunnel
		if (info.intPartY == 6 // hardcoded check for position of the western tunnel 
			&& unit.dir == Direction::RIGHT) {
			unit.dir = Direction::DOWN;
			unit.posX = 13.5; // move the unit to the center of the second exit
			unit.posY = 4.5;
			return true;

		}
		else if (info.intPartY == 4 // hardcoded check for position of the eastern tunnel 
			&& unit.dir == Direction::UP) {
			unit.dir = Direction::LEFT;
			unit.posX = 5.5; // move the unit to the center of the second exit
			unit.posY = 6.5;
			return true;
		}
	}

	return false;
}

void PacmanApp::UpdateSpiders() {
	for(auto& sp : spiders) {
		MovementInfo info;
		sp.GetMovementInfo(true, tileMap, info);
		// update spider
		sp.Update(tileMap, info);
		
		// actually, spiders shouldn't use the tunnel at all
		// todo there is a bug - spiders can stuck in the tunnel
		// CheckTunnel(sp, info);

		// update world transform
		auto trans = MapToWorld(sp.posX, sp.posY);
		auto sprite = sp.sprite;
		sprite->GetTransform().localPos.x = trans.x;
		sprite->GetTransform().localPos.y = trans.y;
	}
}

void PacmanApp::CheckCollisions() {

	// very simple collision detection -> check against each spider on the map
	if (player.state != STATE_VICTORY && player.state != STATE_DEAD) {
		for (auto it = spiders.begin(); it != spiders.end();) {
			auto& spider = *it;
			// pythagorean theorem :-). Threshold set to 25% of the size of the map cell should be enough
			bool collides = sqrt((player.posX - spider.posX) * (player.posX - spider.posX) + (player.posY - spider.posY) * (player.posY - spider.posY)) < 0.25f;

			if (collides) {
				if (spider.state == STATE_RUSH_MODE) {
					// kill the spider
					sprites.RemoveSpider(spider.sprite);
					it = spiders.erase(it);
					continue;
				}
				else {
					// kill pacman and remove all spiders
					player.state = STATE_DEAD;
					deadTime = ofGetElapsedTimeMillis();
					for (auto& spider : spiders) {
						sprites.RemoveSpider(spider.sprite);
					}
					spiders.clear();
					break;
				}
			}

			it++;
		}
	}
}

void PacmanApp::CheckRushMode() {
	if (isRushMode && (ofGetElapsedTimeMillis() - rushModeTime) >= rushModeDuration) {
		// disable rush mode
		isRushMode = false;
		for (auto& spider : spiders) {
			spider.state = STATE_RUSH_MODE;
		}
	}
}

void PacmanApp::UpdateStaticAnim() {
	// update animation each third frame
	if (frameCounter % 3 == 0) {
		sprites.fountain->SetFrame((sprites.fountain->GetFrame() + 1) % 4);
		sprites.river->SetFrame((sprites.river->GetFrame() + 1) % 4);

		for (auto& bSprite : sprites.pelletSprites) {
			bSprite.second->SetFrame((bSprite.second->GetFrame() + 1) % 16);
		}
	}
}

void PacmanApp::UpdatePlayer() {
	
	MovementInfo info;
	player.GetMovementInfo(player.state != STATE_VICTORY && player.state != STATE_DEAD, tileMap, info);

	if (player.state == STATE_DEAD && (ofGetElapsedTimeMillis() - deadTime) >= deadTimeDuration) {
		// reset state
		player.state = STATE_NONE;
	}

	if (player.state == STATE_VICTORY && (ofGetElapsedTimeMillis() - winTime) >= winTimeDelay) {
		// reset the whole game
		ResetGame();
		return;
	}

	CheckCollisions();

	// logic for pac-dots eating
	if (info.isAroundCenter) {
		
		// calculate index of the map cell
		int index = info.intPartY*gridWidth + info.intPartX;

		// find either a pacdot or a pellet
		auto found = dotsAndPellets.find(index);

		if (found != dotsAndPellets.end()) {

			if (info.isInCenter) {
				// remove object when pacman is directly in the middle of a map cell
				dotsAndPellets.erase(found);

				// check if we have eaten a dot or a pellet
				if (tileMap.GetTile(info.intPartX, info.intPartY).specialFunction == FUNCTION_BONUS) {
					
					sprites.RemovePellet(index);

					// switch to the rush mode!
					for (auto& spider : spiders) {
						spider.state = STATE_RUSH_MODE;
					}
					isRushMode = true;
					rushModeTime = ofGetElapsedTimeMillis();
				}
				else {
					sprites.RemovePacDot(index);

					if (--remainingDots <= 0) {
						player.state = STATE_VICTORY;
						winTime = ofGetElapsedTimeMillis();
					}
				}
			}
			else {
				// just play the animation
				player.eatingAnimRunning = true;
			}
		}
	}
	else {
		player.eatingAnimRunning = false;
		player.state = STATE_NONE;
	}

	player.FollowPath(info);
	player.Update(pressedKeys, info);

	// check the tunnel
	CheckTunnel(player, info);

	// update world transform
	auto trans = MapToWorld(player.posX, player.posY);
	player.sprite->GetTransform().localPos.x = trans.x;
	player.sprite->GetTransform().localPos.y = trans.y;
}

void PacmanApp::UpdateGate() {
	auto& gate = tileMap.GetTileByFunction(FUNCTION_GATE);
	float gateCenterX = gate.x + 1;
	float gateCenterY = gate.y + 0.5f;
	bool isPlayerNearby = abs(gateCenterX - player.posX) <= 1.2f && abs(gateCenterY - player.posY) <= 1.2f;

	// process state of the gate
	if (isPlayerNearby) {
		if (gate.state == STATE_GATE_CLOSED || gate.state == STATE_GATE_CLOSING || gate.state == STATE_NONE) {
			gate.state = STATE_GATE_OPENING;
		}
	}
	else if (gate.state == STATE_GATE_OPENED || gate.state == STATE_GATE_OPENING) {
		gate.state = STATE_GATE_CLOSING;
	}

	if(gate.state == STATE_GATE_OPENING && (frameCounter % 3 == 0)) {
		this->sprites.gate->SetFrame(min(this->sprites.gate->GetFrame() + 1, 7));
	}

	if (gate.state == STATE_GATE_CLOSING && (frameCounter % 3 == 0)) {
		this->sprites.gate->SetFrame(max(this->sprites.gate->GetFrame() - 1, 0));
	}

	if (gate.state == STATE_GATE_OPENING && this->sprites.gate->GetFrame() == 7) {
		gate.state = STATE_GATE_OPENED;
	}

	if (gate.state == STATE_GATE_CLOSING && this->sprites.gate->GetFrame() == 0) {
		gate.state = STATE_GATE_CLOSED;
	}

}

void PacmanApp::UpdateSpawner() {

	auto& spawndoor = tileMap.GetTileByFunction(FUNCTION_SPAWNER);

	if (player.state != STATE_VICTORY && player.state != STATE_DEAD) {

		// process state of the spawner
		if ((ofGetElapsedTimeMillis() - lastSpawn) > spawnInterval) {
			lastSpawn = ofGetElapsedTimeMillis();
			spawndoor.state = STATE_GATE_OPENING;
		}

		if (spawndoor.state == STATE_GATE_OPENING && (frameCounter % 3 == 0)) {
			this->sprites.spiderGate->SetFrame(min(this->sprites.spiderGate->GetFrame() + 1, 7));
		}

		if (spawndoor.state == STATE_GATE_CLOSING && (frameCounter % 3 == 0)) {
			this->sprites.spiderGate->SetFrame(max(this->sprites.spiderGate->GetFrame() - 1, 0));
		}

		if (spawndoor.state == STATE_GATE_OPENING && this->sprites.spiderGate->GetFrame() == 7) {
			spawndoor.state = STATE_GATE_OPENED;
		}

		if (spawndoor.state == STATE_GATE_CLOSING && this->sprites.spiderGate->GetFrame() == 0) {
			spawndoor.state = STATE_GATE_CLOSED;
		}

		if(spawndoor.state == STATE_GATE_OPENED) {
			// spawn a new spider
			auto trans = Trans(MapToWorld(9 + 0.5f, 4 + 0.5f)); // hardcoded position of the center box :-)
			auto spiderSprite = sprites.AddSpider(trans);

			Spider spider;
			spider.sprite = spiderSprite;
			spider.dir = Direction::DOWN;
			spider.posX = 9 + 0.5f;
			spider.posY = 4 + 0.5f;
			spiders.push_back(spider);
			
			spawndoor.state = STATE_GATE_CLOSING;
		}
	}
}

void PacmanApp::UpdateText() {
	// ASCII characters only. ofTextLabel is just a dummy openframeworks plugin
	sprites.textMesh->SetText(string_format("REMAINING DOTS: %d",remainingDots).c_str());
}

//--------------------------------------------------------------
void PacmanApp::update() {
	frameCounter++;
	UpdateSpiders();
	CheckRushMode();
	UpdateStaticAnim();
	UpdatePlayer();
	UpdateGate();
	UpdateSpawner();
	UpdateText();
}

//--------------------------------------------------------------
void PacmanApp::draw() {
	renderer->ClearBuffers();
	renderer->BeginRender();

	// add objects into renderer
	for (auto mesh : meshes) {
		// update transformation (actually, this may be done in update() method)
		mesh->GetTransform().CalcAbsTransform(rootTransform);
		renderer->PushNode(mesh);
	}

	renderer->Render();
	renderer->EndRender();
}

//--------------------------------------------------------------
void PacmanApp::keyPressed(int key) {
	pressedKeys.insert(key);
}

//--------------------------------------------------------------
void PacmanApp::keyReleased(int key) {
	pressedKeys.erase(key);
}

//--------------------------------------------------------------
void PacmanApp::windowResized(int w, int h) {
	
	// we need to have map image loaded in order to scale root transform to fit the whole screen
	if(mapImage != nullptr) {
		float aspectRatio = ((float)w) / h;

		int rendererWidth = 0;
		int rendererHeight = 0;

		if (aspectRatio < virtualAspectRatio) {
			rendererWidth = w;
			rendererHeight = (int)(w / virtualAspectRatio);
		}
		else {
			rendererWidth = (int)(h*virtualAspectRatio);
			rendererHeight = h;
		}

		renderer->SetVirtualWidth(rendererWidth);
		renderer->SetVirtualHeight(rendererHeight);

		// scale the root object so that the scene fits the screen
		float aspectDiff = ((float)rendererWidth) / mapImage->getWidth();
		rootTransform.scale = ofVec3f(aspectDiff);
		rootTransform.SetAbsAsLocal();
	}
}
