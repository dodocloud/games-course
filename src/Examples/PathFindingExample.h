#pragma once

#include "AphMain.h"
#include "Renderable.h"
#include "Renderer.h"
#include "GridMap.h"
#include "Sprite.h"
#include <map>
#include "PathFinder.h"

using namespace std;

#define MAP_WIDTH 50
#define MAP_HEIGHT 30
#define MAP_CELL_SIZE 32

#define SPRITE_PATH 0
#define SPRITE_OBSTRUCTION 1
#define SPRITE_ARROW 2
#define SPRITE_CLICK 3
#define SPRITE_VISITED 4
#define SPRITE_SLOW_PATH 5

// cost of slower path
#define SLOW_PATH_COST 10


class PathFindingExample : public ofBaseApp {
public:
	// static map
	// 0 = passable
	// 1 = obstruction
	// 2 = passable but higher cost (mud, forest, sand, whatever...)
	int map[MAP_HEIGHT][MAP_WIDTH] = {
		{ 0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0 },
		{ 0,0,2,2,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0 },
		{ 0,0,2,2,0,0,0,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0 },
		{ 0,0,2,2,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,2,0,0,1,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,2,2,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,2,0,0,0,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,1,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,1,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,1,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,2,2,2,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,2,0,0,1,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,2,0,0,1,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,1,0,0,1,1,1,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,2,2,2,0,0,0,1,0,0 },
		{ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,2,2,2,1,0,0,0,0,0 },
		{ 0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,2,2,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,1,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0 },
		{ 0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,2,2,1,0,0,0,0,0 },
		{ 0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,0,0,2,2,2,2,1,1,1,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,1,0,1,0,0,0,2,2,2,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,1,0,1,0,1,0,2,2,2,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,2,0,0,0,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,1,0,0,0,1,0,2,2,2,0,1,0,0,0,2,2,2,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,1,0,0,0,1,0,0,2,0,0,1,0,0,0,2,2,2,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,1,0,0,2,1,1,1,0,0,0,2,2,2,1,0,0,1,1,1,0,0,0,0,0,0,1,0,0,2,0,0,1,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,1,0,0,2,1,0,0,0,0,0,2,2,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,1,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,2,2,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,1,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 1,1,1,0,0,0,1,1,1,1,1,0,0,0,0,0,2,2,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,2,0,0,1,0,0,0,2,2,2,1,0,0,1,0,0 },
		{ 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,1,0,0,0,2,2,2,1,0,0,1,0,0 }
	};


	GridMap* grid;

	// last index of the map the mouse entered
	int mouseMapIndex = -1;

	// transformation of the root element
	Trans rootTransform;

	// if the resolution changes, we need to keep original aspect ratio
	// renderer draws two black rectangles that covers oversized viewport
	float virtualAspectRatio = 2.0f;

	// images
	ofImage* spritesImage = nullptr;

	vector<Renderable*> meshes;
	SpriteSheet* sheet;
	MultiSpriteMesh* mapTiles;
	MultiSpriteMesh* arrows;
	// mesh for visited map blocks
	MultiSpriteMesh* visited;
	std::map<int, Sprite*> sprites;

	// renderer component
	Renderer* renderer;

	AStarSearch pathFinder;

	void RecreateMap();

	void Recalc(int x, int y);

	/**
	* Sets sprite index according to the type of the block of the map
	*/
	void SetSpriteIndex(Vec2i mapPos) {
		auto index = MapIndexByCoord(mapPos.x, mapPos.y);
		auto elevation = grid->GetElevation(mapPos);
		bool hasObstr = grid->HasObstruction(mapPos.x, mapPos.y);
		sprites[index]->SetFrame(hasObstr ? SPRITE_OBSTRUCTION : elevation == 1 ? SPRITE_PATH : SPRITE_SLOW_PATH);
	}

	/**
	* Transforms map coordinates into world coordinates
	*/
	ofVec3f MapToWorld(int x, int y) {
		return ofVec3f(x * MAP_CELL_SIZE, y * MAP_CELL_SIZE, 1);
	}

	/**
	* Transforms world coordinates into map coordinates
	*/
	Vec2i WorldToMap(float x, float y) {
		return Vec2i(x / MAP_CELL_SIZE, y / MAP_CELL_SIZE);
	}

	/**
	* Gets map index by coordinate
	*/
	int MapIndexByCoord(int x, int y) {
		return y*MAP_WIDTH + x;
	}

	/**
	* Gets map coordinate by index
	*/
	Vec2i MapCoordByIndex(int index) {
		return Vec2i(index % MAP_WIDTH, index / MAP_WIDTH);
	}

	void setup();
	void update();
	void draw();

	void keyPressed(int key);
	void keyReleased(int key);
	void mouseMoved(int x, int y);
	void mousePressed(int x, int y, int button);
	void windowResized(int w, int h);
};
