#include "AphMain.h"
#include "GameSprites.h"
#include "SpriteSheetBuilder.h"
#include "GameObject.h"

void GameSprites::Initialize(ofImage* mapImage, ofImage* spritesImage) {
	// build sprites
	SpriteSheetBuilder builder;

	// offset [0, 5] is located 5*SpriteSize px from the top
	spritesheets["pacman"] = builder.Image(spritesImage).Offset(0, 0).SpriteSize(32, 32).Frames(16 * 4).BuildAndReset();
	spritesheets["spider"] = builder.Image(spritesImage).Offset(0, 5).SpriteSize(32, 32).Frames(16 * 4).BuildAndReset();
	spritesheets["gems"] = builder.Image(spritesImage).Offset(8, 14).SpriteSize(32, 32).Frames(4).BuildAndReset();
	spritesheets["pellets"] = builder.Image(spritesImage).Offset(0, 4).SpriteSize(32, 32).Frames(16).BuildAndReset();

	// for these three, offset is set in pixels, because they occupy more than one block
	spritesheets["river"] = builder.Image(spritesImage).OffsetPx(0, 32 * 9).SpriteSize(32 * 2, 32 * 7).Frames(4).BuildAndReset();
	spritesheets["fountain"] = builder.Image(spritesImage).OffsetPx(32 * 10, 32 * 9).SpriteSize(32 * 3, 32).Frames(4).BuildAndReset();
	spritesheets["gate"] = builder.Image(spritesImage).OffsetPx(32 * 8, 32 * 11).SpriteSize(32 * 2, 32).Frames(8).BuildAndReset();

	spritesheets["spider_gate"] = builder.Image(spritesImage).Offset(8, 15).SpriteSize(32, 32).Frames(8).BuildAndReset();
	spritesheets["background"] = builder.Image(mapImage).BuildAndReset();

	// create mesh for background
	background = new SpriteMesh(Sprite(spritesheets["background"], 0, 0), "bgrLayer");

	// create mesh for game objects
	staticMesh = new MultiSpriteMesh("spriteLayer");

	// add player
	player = new Sprite(spritesheets["pacman"], 0);
	staticMesh->AddSprite(player);

	// add static elements (fountain, river and gates)
	fountain = new Sprite(spritesheets["fountain"], 0, Trans(ofVec3f(272, 180, 0)));
	staticMesh->AddSprite(fountain);

	river = new Sprite(spritesheets["river"], 0, Trans(ofVec3f(0, 90, 0)));
	staticMesh->AddSprite(river);

	gate = new Sprite(spritesheets["gate"], 0, Trans(ofVec3f(350, 60, 0)));
	staticMesh->AddSprite(gate);

	spiderGate = new Sprite(spritesheets["spider_gate"], 0, Trans(ofVec3f(304, 134, 0)));
	staticMesh->AddSprite(spiderGate);

	// create mesh for dots
	dotMesh = new MultiSpriteMesh("spriteLayer");
	// create mesh for pellets
	pelletMesh = new MultiSpriteMesh("spriteLayer");
	// create mesh for spiders
	spiderMesh = new MultiSpriteMesh("spriteLayer");

	// create mesh for text
	auto font = new ofTrueTypeFont();

	font->load("Pacman/impact.ttf", 40);
	textMesh = new Text(font);
	textMesh->SetColor(ofColor(250, 255, 0));
}

void GameSprites::Reset() {
	dotSprites.clear();
	pelletSprites.clear();
	spiderMesh->RemoveAllSprites();
	pelletMesh->RemoveAllSprites();
	dotMesh->RemoveAllSprites();

}

Sprite* GameSprites::AddSpider(Trans& position) {
	auto spiderSpr = new Sprite(spritesheets["spider"], 0, position);
	spiderMesh->AddSprite(spiderSpr);

	return spiderSpr;
}

void GameSprites::RemoveSpider(Sprite* spider) {
	spiderMesh->RemoveSprite(spider, true);
}

void GameSprites::AddPacDot(Trans& position, int mapIndex) {
	auto dotSprite = new Sprite(spritesheets["gems"], 1, position);
	// add into collection of sprites
	dotSprites[mapIndex] = dotSprite;
	// add into mesh (renderer needs it)
	dotMesh->AddSprite(dotSprite);
}

void GameSprites::RemovePacDot(int mapIndex) {
	auto mesh = dotSprites.find(mapIndex);
	auto sprite = mesh->second;
	// add into collection of sprites
	dotSprites.erase(mesh);
	// add into mesh (renderer needs it)
	dotMesh->RemoveSprite(sprite);
}

void GameSprites::AddPellet(Trans& position, int mapIndex) {
	auto pelletSprite = new Sprite(spritesheets["pellets"], 1, position);
	pelletSprites[mapIndex] = pelletSprite;
	pelletMesh->AddSprite(pelletSprite);
}

void GameSprites::RemovePellet(int mapIndex) {
	auto mesh = pelletSprites.find(mapIndex);
	auto sprite = mesh->second;
	pelletSprites.erase(mesh);
	pelletMesh->RemoveSprite(sprite);
}