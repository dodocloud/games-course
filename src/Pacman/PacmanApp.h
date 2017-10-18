#pragma once

#include "AphMain.h"
#include "Renderable.h"
#include "Renderer.h"
#include "Map.h"
#include "MovementInfo.h"
#include "GameUnit.h"
#include "Spider.h"
#include "Player.h"
#include "GameSprites.h"


class PacmanApp : public ofBaseApp {
public:
	
	// ================== MODEL ================== 
	// map
	Map tileMap;
	// set of remaining pac-dots and pellets. Each number represents a grid-cell index
	set<int> dotsAndPellets;
	// number of remaining dots
	int remainingDots;
	// rush-mode indicator (pacman can kill spiders in that mode)
	bool isRushMode = false;
	
	// ------- TIME SETTINGS ------- 
	// last execution time of the rush mode
	uint64_t rushModeTime = 0;
	// duration of the rush mode
	uint64_t rushModeDuration = 10000;
	// last execution time of dead
	uint64_t deadTime = 0;
	// duration of the dead mode (before the game is restored)
	uint64_t deadTimeDuration = 3000;
	// last execution time of win
	uint64_t winTime = 0;
	// duration of the win mode (before the game is restored)
	uint64_t winTimeDelay = 3000;
	// the time the last spider was spawned
	uint64_t lastSpawn = 0;
	// interval of spider spawner
	uint64_t spawnInterval = 6000;


	// map size in number of blocks; this level has grid 19x11 blocks
	int gridWidth = 19;
	int gridHeight = 11;

	int frameCounter = 0;

	// dynamic entities
	Player player;
	vector<Spider> spiders;

	// all pressed keys
	set<int> pressedKeys;

	// transformation of the root element
	Trans rootTransform;

	// ================== VIEW ================== 
	
	// if the resolution changes, we need to keep original aspect ratio
	// renderer draws two black rectangles that covers oversized viewport
	float virtualAspectRatio = 2.0f;

	// images
	ofImage* mapImage = nullptr;
	ofImage* spritesImage = nullptr;

	// all sprites
	GameSprites sprites;

	// offset where the first map block starts (measured in pixels of the image map)
	int gridOffsetX = 17;
	int gridOffsetY = 20;

	// width of one map cell
	int blockWidth = 32;
	// height of one map cell
	int blockHeight = 24;


	// all meshes (sprites, images and score text)
	vector<Renderable*> meshes;
	
	// renderer component
	Renderer* renderer;
	
	/**
	 * Transforms map coordinates into world coordinates
	 */
	ofVec3f MapToWorld(float x, float y) {
		float fX = gridOffsetX+((x - 0.5f)*blockWidth);
		float fY = gridOffsetY+((y - 0.5f)*blockHeight);
		float fZ = 1;

		return ofVec3f(fX, fY, fZ);
	}

	// game reset to its initial state
	void ResetGame();

	// update logic of spiders
	void UpdateSpiders();

	// checks for collision with pacman (very simple one-to-many comparing)
	void CheckCollisions();

	// checks whether the pacman is in the tunnel and teleports it to the second exit
	bool CheckTunnel(GameUnit& unit, MovementInfo& info);

	// checks whether the rush mode is enabled
	void CheckRushMode();

	// updates static animations
	void UpdateStaticAnim();

	// updates player's movement and eating process
	void UpdatePlayer();

	// updates gate animation
	void UpdateGate();

	// updates center box
	void UpdateSpawner();

	// updates score
	void UpdateText();

	void setup();
	void update();
	void draw();

	void keyPressed(int key);
	void keyReleased(int key);
	void windowResized(int w, int h);
};
