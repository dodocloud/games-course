#include "SpriteSheet.h"


SpriteSheet::SpriteSheet(ofImage* spriteAtlas, string name, int totalFrames,
	int spriteWidth, int spriteHeight)
	: SpriteSheet(spriteAtlas, name, 0, 0, totalFrames, spriteWidth, spriteHeight, 0, 0) {

	spriteSheetWidth = spriteAtlas->getWidth();
	spriteSheetHeight = spriteAtlas->getHeight();
}

SpriteSheet::SpriteSheet(ofImage* spriteAtlas, string name, int totalFrames,
	int spriteWidth, int spriteHeight, int spriteSheetWidth, int spriteSheetHeight)
	: SpriteSheet(spriteAtlas, name, 0, 0, totalFrames, spriteWidth, spriteHeight, spriteSheetWidth, spriteSheetHeight) {

}

SpriteSheet::SpriteSheet(ofImage* spriteAtlas, string name, int offsetX, int offsetY, int totalFrames,
	int spriteWidth, int spriteHeight, int spriteSheetWidth, int spriteSheetHeight)
	: spriteAtlas(spriteAtlas), name(name), offsetX(offsetX), offsetY(offsetY), totalFrames(totalFrames), spriteWidth(spriteWidth),
	spriteHeight(spriteHeight), spriteSheetWidth(spriteSheetWidth), spriteSheetHeight(spriteSheetHeight) {

	spriteAtlasWidth = spriteAtlas->getWidth();
	spriteAtlasHeight = spriteAtlas->getHeight();
}
