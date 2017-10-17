#pragma once

#include "ofImage.h"
#include <map>
#include "Transform.h"
using namespace std;

// forward declaration
class Sprite;
class MultiSpriteMesh;
class SpriteMesh;
class SpriteSheet;
class Text;

/**
 * Sprites for PACMAN
 */
struct GameSprites {
	// sprite sheets mapped by their names
	map<string, SpriteSheet*> spritesheets;

	// sprites mapped by their map indices 0 gives [0,0], 1 gives [0,1] and so on
	map<int, Sprite*> dotSprites;
	map<int, Sprite*> pelletSprites;

	// these sprites are inside staticMesh, however we need to animate them. 
	// That's why we keep pointers to them explicitly
	Sprite* river;
	Sprite* fountain;
	Sprite* gate;
	Sprite* spiderGate;
	Sprite* player;

	// ===== Meshes for renderer =====
	// they keep their own collections of all sprites

	// mesh for background
	SpriteMesh* background;
	// mesh for map elements (gate, spawner, river, fountain)
	MultiSpriteMesh* staticMesh;
	// mesh for pac-dot sprites
	MultiSpriteMesh* dotMesh;
	// mesh for power-pellets
	MultiSpriteMesh* pelletMesh;
	// mesh for spiders
	MultiSpriteMesh* spiderMesh;

	Text* textMesh;

	void Initialize(ofImage* mapImage, ofImage* spritesImage);

	void Reset();

	Sprite* AddSpider(Trans& position);

	void RemoveSpider(Sprite* spider);

	void AddPacDot(Trans& position, int mapIndex);

	void RemovePacDot(int mapIndex);

	void AddPellet(Trans& position, int mapIndex);

	void RemovePellet(int mapIndex);
};