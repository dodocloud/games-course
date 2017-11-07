#pragma once

#include "AphMain.h"
#include "Renderable.h"
#include "Renderer.h"
#include "GridMap.h"
#include "Sprite.h"
#include <map>
#include "PathFinder.h"
#include "SpriteSheetBuilder.h"
#include "PerlinNoiseExample.h"
#include "PathFindingExample.h"

using namespace std;

class Homework2 : public ofBaseApp {
public:
	// grid map
	GridMap* grid;
	// last index of the map the mouse entered
	int mouseMapIndex = -1;
	// transformation of the root element
	Trans rootTransform;
	// if the resolution changes, we need to keep original aspect ratio
	// renderer draws two black rectangles that covers oversized viewport
	float virtualAspectRatio = 2.0f;
	// sprite atlas (homework2.png)
	ofImage* spritesImage = nullptr;
	// list of all meshes
	vector<Renderable*> meshes;
	// link to the sprite sheet
	SpriteSheet* sheet;
	// map tiles
	MultiSpriteMesh* mapTiles;
	// arrows that follow the path
	MultiSpriteMesh* arrows;
	// sprites of all map tiles, mapped by their indices
	std::map<int, Sprite*> sprites;

	// renderer component
	Renderer* renderer;
	AStarSearch pathFinder;

	int mapWidth = 80;
	int mapHeight = 40;
	int mapCellSize = 32;

	void setup() {
		if (CheckAPHVersion()) {

			ofSetFrameRate(60);
			virtualAspectRatio = ((float)ofGetWindowSize().x) / ofGetWindowSize().y;
			// initialize renderer
			renderer = new Renderer();
			renderer->OnInit();
			// load sprite sheets
			spritesImage = new ofImage("Examples/homework2.png");
			SpriteSheetBuilder builder;
			sheet = builder.Image(spritesImage).Offset(0, 0).SpriteSize(32, 32).Frames(8).BuildAndReset();
			// initialize virtual size
			windowResized(ofGetWindowSize().x, ofGetWindowSize().y);
			renderer->AddTileLayer(spritesImage, "spriteLayer", 10000, 1);
			mapTiles = new MultiSpriteMesh("spriteLayer");
			arrows = new MultiSpriteMesh("spriteLayer");

			meshes.push_back(mapTiles);
			meshes.push_back(arrows);

			InitMap();
			RecreateMap();
		}
	}

	void InitMap() {
		// max elevation is 9
		grid = new GridMap(MapType::OCTILE, 9, mapWidth, mapHeight);

		for (int i = 0; i < mapHeight; i++) {
			for (int j = 0; j < mapWidth; j++) {
				grid->SetElevation(Vec2i(j, i), 9); // constant elevation for all tiles
			}
		}
	}

	void RecreateMap() {
		// delete all map blocks
		mapTiles->RemoveAllSprites(true);
		sprites.clear();

		// create sprites
		for (int i = 0; i < mapWidth; i++) {
			for (int j = 0; j < mapHeight; j++) {
				Sprite* spr = new Sprite(sheet, 0);
				spr->GetTransform().localPos = MapToWorld(i, j);
				mapTiles->AddSprite(spr);
				sprites[MapIndexByCoord(i, j)] = spr;
				SetSpriteIndex(Vec2i(i, j));
			}
		}
	}

	/**
	 * Recalculates path between start and end point
	 */
	void RecalcPath(int x, int y) {

		Vec2i startPoint = Vec2i(0, 10);

		this->arrows->RemoveAllSprites(true);

		for (auto spr : sprites) {
			Vec2i mapPos = MapCoordByIndex(spr.first);
			SetSpriteIndex(mapPos);
		}

		// recalculate path
		PathFinderContext context;
		bool found = pathFinder.Search(*grid, startPoint, Vec2i(x, y), context);

		if (found) {
			DrawArrowsFromPath(context);
		}
	}


	void DrawArrowsFromPath(PathFinderContext& context) {
		auto& steps = context.pathFound;

		for (int i = 0; i < steps.size() - 1; i++) {
			auto& from = steps[i];
			auto& to = steps[i + 1];

			Sprite* arrow = new Sprite(sheet, 13);

			auto dir = Vec2i::GetDirection(from, to);

			switch (dir) {
			case VDirection::NORTH:
				arrow->GetTransform().rotation = -90;
				break;
			case VDirection::NORTH_EAST:
				arrow->GetTransform().rotation = -45;
				break;
			case VDirection::EAST:
				arrow->GetTransform().rotation = 0;
				break;
			case VDirection::SOUTH_EAST:
				arrow->GetTransform().rotation = 45;
				break;
			case VDirection::SOUTH:
				arrow->GetTransform().rotation = 90;
				break;
			case VDirection::SOUTH_WEST:
				arrow->GetTransform().rotation = 135;
				break;
			case VDirection::WEST:
				arrow->GetTransform().rotation = 180;
				break;
			case VDirection::NORTH_WEST:
				arrow->GetTransform().rotation = -135;
				break;
			}

			arrow->GetTransform().localPos = MapToWorld(from.x, from.y);
			arrows->AddSprite(arrow);
		}
	}

	/**
	* Sets sprite index according to the type of the block of the map
	*/
	void SetSpriteIndex(Vec2i mapPos) {
		auto index = MapIndexByCoord(mapPos.x, mapPos.y);
		auto elevation = grid->GetElevation(mapPos);
		sprites[index]->SetFrame(elevation);
	}

	/**
	* Transforms map coordinates into world coordinates
	*/
	ofVec3f MapToWorld(int x, int y) {
		return ofVec3f(x * mapCellSize, y * mapCellSize, 1);
	}

	/**
	* Transforms world coordinates into map coordinates
	*/
	Vec2i WorldToMap(float x, float y) {
		return Vec2i(x / mapCellSize, y / mapCellSize);
	}

	/**
	* Gets map index by coordinate
	*/
	int MapIndexByCoord(int x, int y) {
		return y*mapWidth + x;
	}

	/**
	* Gets map coordinate by index
	*/
	Vec2i MapCoordByIndex(int index) {
		return Vec2i(index % mapWidth, index / mapWidth);
	}

	//--------------------------------------------------------------
	void draw() {
		renderer->ClearBuffers();
		renderer->BeginRender();

		// add objects into renderer
		for (auto mesh : meshes) {
			mesh->GetTransform().CalcAbsTransform(rootTransform);
			renderer->PushNode(mesh);
		}
		renderer->Render();
		renderer->EndRender();
	}


	void mouseMoved(int x, int y) {
		float realX = (x - ofGetCurrentViewport().x) / rootTransform.scale.x;
		float realY = (y - ofGetCurrentViewport().y) / rootTransform.scale.y;

		Vec2i pos = WorldToMap(realX, realY);

		auto index = MapIndexByCoord(pos.x, pos.y);

		// on mouse move, recalculate path
		if (index != mouseMapIndex) {
			if (pos.x >= 0 && pos.y >= 0 && pos.x < MAP_WIDTH && pos.y < MAP_HEIGHT) {
				mouseMapIndex = MapIndexByCoord(pos.x, pos.y);
				RecalcPath(pos.x, pos.y);
			}
			else {
				mouseMapIndex = -1;
			}
		}
	}


	//--------------------------------------------------------------
	void windowResized(int w, int h) {
		// we need to have map image loaded in order to scale root transform to fit the whole screen
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
		float aspectDiff = ((float)rendererWidth) / 1600;
		rootTransform.scale = ofVec3f(aspectDiff);
		rootTransform.SetAbsAsLocal();
	}

};
