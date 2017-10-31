#include "PathFindingExample.h"
#include "AphUtils.h"
#include "SpriteSheetBuilder.h"
#include "MapLoader.h"

//--------------------------------------------------------------
void PathFindingExample::setup() {
	if (CheckAPHVersion()) {

		ofSetFrameRate(60);
		virtualAspectRatio = ((float)ofGetWindowSize().x) / ofGetWindowSize().y;

		// initialize renderer
		renderer = new Renderer();
		renderer->OnInit();

		// load sprite sheets
		spritesImage = new ofImage("Examples/pathfinding.png");
		SpriteSheetBuilder builder;
		
		sheet = builder.Image(spritesImage).Offset(0, 0).SpriteSize(32, 32).Frames(8).BuildAndReset();

		// initialize virtual size
		windowResized(ofGetWindowSize().x, ofGetWindowSize().y);

		// add map tiles and paths
		renderer->AddTileLayer(spritesImage, "spriteLayer", 10000, 1);
		mapTiles = new MultiSpriteMesh("spriteLayer");
		arrows = new MultiSpriteMesh("spriteLayer");
		visited = new MultiSpriteMesh("spriteLayer");

		meshes.push_back(mapTiles);
		meshes.push_back(visited);
		meshes.push_back(arrows);

		// initialize grid from the static array
		grid = new GridMap(MAP_WIDTH, MAP_HEIGHT);

		for(int i=0; i<MAP_HEIGHT; i++) {
			for(int j=0; j<MAP_WIDTH; j++) {
				int mapCell = map[i][j];
				if(mapCell == 1) {
					// add obstacles
					grid->AddObstruction(j, i);
				}else if(mapCell == 2) {
					grid->SetCost(Vec2i(j,i), SLOW_PATH_COST);
				}else {
					// 0 -> nothing to do
				}
			}
		}

		// recreate view model
		RecreateMap();
	}
}

void PathFindingExample::RecreateMap() {
	
	// delete all map blocks
	mapTiles->RemoveAllSprites(true);
	sprites.clear();

	// create sprites
	for (int i = 0; i<MAP_WIDTH; i++) {
		for (int j = 0; j<MAP_HEIGHT; j++) {

			Sprite* spr = new Sprite(sheet, 0);
			spr->GetTransform().localPos = MapToWorld(i, j);
			mapTiles->AddSprite(spr);
			sprites[MapIndexByCoord(i, j)] = spr;
			SetSpriteIndex(Vec2i(i, j));
		}
	}
}

void PathFindingExample::Recalc(int x, int y) {

	this->arrows->RemoveAllSprites(true);
	this->visited->RemoveAllSprites(true);

	for(auto spr : sprites) {
		Vec2i mapPos = MapCoordByIndex(spr.first);
		SetSpriteIndex(mapPos);
	}

	// recalculate path
	PathFinderContext currentContext;
	bool found = pathFinder.Search(*grid, Vec2i(0, 15), Vec2i(x, y), currentContext);

	
	// draw visited blocks
	for(auto visitedBlock : currentContext.visited) {
		Sprite* visitedSpr = new Sprite(sheet, SPRITE_VISITED);
		visitedSpr->GetTransform().localPos = MapToWorld(visitedBlock.x, visitedBlock.y);
		visited->AddSprite(visitedSpr);
	}

	if (found) {
		auto& steps = currentContext.pathFound;

		for (int i = 0; i < steps.size() - 1; i++) {
			auto& from = steps[i];
			auto& to = steps[i + 1];

			Sprite* arrow = new Sprite(sheet, 2);

			if (from.x < to.x) {
				// right arrow
				arrow->GetTransform().rotation = 0;
			}
			else if (from.x > to.x) {
				// left arrow
				arrow->GetTransform().rotation = 180;
			}
			else if (from.y < to.y) {
				// bottom arrow
				arrow->GetTransform().rotation = 90;
			}
			else {
				// top arrow
				arrow->GetTransform().rotation = -90;
			}

			arrow->GetTransform().localPos = MapToWorld(from.x, from.y);
			arrows->AddSprite(arrow);
		}
	}
}

//--------------------------------------------------------------
void PathFindingExample::update() {

}

//--------------------------------------------------------------
void PathFindingExample::draw() {
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

//--------------------------------------------------------------
void PathFindingExample::keyPressed(int key) {

}

//--------------------------------------------------------------
void PathFindingExample::keyReleased(int key) {

}

void PathFindingExample::mouseMoved(int x, int y) {
	float realX = (x - ofGetCurrentViewport().x) / rootTransform.scale.x;
	float realY = (y - ofGetCurrentViewport().y) / rootTransform.scale.y;

	Vec2i pos = WorldToMap(realX, realY);

	auto index = MapIndexByCoord(pos.x, pos.y);

	// on mouse move, recalculate path
	if (index != mouseMapIndex) {
		if (mouseMapIndex != -1) {
			Vec2i mapPos = MapCoordByIndex(mouseMapIndex);
			SetSpriteIndex(mapPos);
		}

		if (pos.x >= 0 && pos.y >= 0 && pos.x < MAP_WIDTH && pos.y < MAP_HEIGHT) {
			mouseMapIndex = MapIndexByCoord(pos.x, pos.y);
			Recalc(pos.x, pos.y);	
			sprites[index]->SetFrame(3);
		}
		else {
			mouseMapIndex = -1;
		}
	}
}

void PathFindingExample::mousePressed(int x, int y, int button) {
	float realX = (x - ofGetCurrentViewport().x) / rootTransform.scale.x;
	float realY = (y - ofGetCurrentViewport().y) / rootTransform.scale.y;

	Vec2i pos = WorldToMap(realX, realY);

	// on mouse click, add or remove obstruction
	if (pos.x >= 0 && pos.y >= 0 && pos.x < MAP_WIDTH && pos.y < MAP_HEIGHT) {
		if(grid->HasObstruction(pos.x, pos.y)) {
			grid->RemoveObstruction(pos.x, pos.y);
		}else {
			grid->AddObstruction(pos.x, pos.y);
		}

		RecreateMap();
		Recalc(pos.x, pos.y);
	}
}

//--------------------------------------------------------------
void PathFindingExample::windowResized(int w, int h) {
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
