#pragma once

#include <map>

using namespace std;

/**
 * Brick with its position and type
 */
struct Brick {
	Vec2i position;
	int type;
};

/**
 * Global game model. Kept in a root object but survives its deleting since the next level
 * is created by recreating the scene and keeping this model only
 */
class ArkanoidModel {
public:
	// list of sprite sheets
	map<string, SpriteSheet*> spriteSheets;
	// bricks mapped by their positions
	map<Vec2i, Brick> bricks;
	
	// bricks mapped by their sprites 
	// used to quickly get a brick of a given sprite since they are kept in a MultiSpriteMesh and therefore we can't use Attributes
	map<Sprite*, Brick> brickMap; 

	// indicator whether the ball has been released (isn't touching the paddle)
	bool ballReleased = false;
	int currentLevel = 0;
	
	int remainingBricks = 0;
	int currentRound = 0;

	// initial ball speed, configurable in JSON file
	float ballSpeed; 
	// multiplier of ball speed for every next level, configurable in JSON file
	float ballSpeedMultiplier;

	// paddle movement speed
	float paddleSpeed = 0.02f;
	
	// offset of the ball when touching the paddle
	float ballOffset = 0.5f;

	int currentLives;

	// number of max lives, configurable in JSON file
	int maxLives;

	// number of levels, configurable in JSON file
	int maxLevels;

	/**
	 * Gets brick related to given aprite
	 */
	Brick& GetBrick(Sprite* spr) {
		return brickMap[spr];
	}

	/**
	 * Removes brick from inner collections
	 */
	void RemoveBrick(Vec2i pos) {
		
		for(auto key : brickMap) {
			if(key.second.position == pos) {
				brickMap.erase(brickMap.find(key.first));
				break;
			}
		}

		bricks.erase(bricks.find(pos));
	}

	/**
	 * Initializes all level-scoped variables
	 */
	void InitLevel() {
		bricks.clear();
		brickMap.clear();
		remainingBricks = 0;
		currentRound = 0;
		ballReleased = false;
		currentLives = maxLives;
	}
};


#define HIT_TYPE_BORDER 0
#define HIT_TYPE_PADDLE 1
#define HIT_TYPE_BLOCK 2

/**
 * Structure that describes collision info
 */
struct HitInfo {

	HitInfo(){}
	
	HitInfo(int hitType, int hitIndex) : hitType(hitType), hitIndex(hitIndex) {
		
	}

	int hitType;  // type of collision
	int hitIndex; // index among collidable entities (used only when colliding with a brick)
};