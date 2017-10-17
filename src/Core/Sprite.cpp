#include "Sprite.h"

Sprite::Sprite(SpriteSheet* spriteSheet, int row, int column) : spriteSheet(spriteSheet) {

	int columns = spriteSheet->GetSpriteSheetWidth() / spriteSheet->GetSpriteWidth();
	this->frame = row*columns + column;
	Recalc();
}

Sprite::Sprite(SpriteSheet* spriteSheet, int frame) : spriteSheet(spriteSheet), frame(frame) {
	Recalc();
}


Sprite::Sprite(SpriteSheet* spriteSheet, int row, int column, Trans& transform) : Sprite(spriteSheet, row, column) {
	this->transform = transform;
}

Sprite::Sprite(SpriteSheet* spriteSheet, int frame, Trans& transform) : Sprite(spriteSheet, frame) {
	this->transform = transform;
}



void Sprite::Recalc() {
	width = spriteSheet->GetSpriteWidth();
	height = spriteSheet->GetSpriteHeight();

	int frameInGrid;
	int totalFramesInGrid = 0;

	if (spriteSheet->GetSpriteSheetWidth() == spriteSheet->GetSpriteAtlasWidth()) {
		// sprite set is continuous; it means that it begins somewhere and when it reaches the end 
		// of the image, the next sprite will be at the beginning of the image
		// EXAMPLE (x for sprite):
		// * * * x x
		// x x x x x
		// x x * * *
		// * * * * *
		// * * * * *
		int firstRowColumns = (spriteSheet->GetSpriteAtlasWidth() - spriteSheet->GetOffsetX()) / width;
		int otherRowsColumns = spriteSheet->GetSpriteAtlasWidth() / width;

		frameInGrid = frame + (otherRowsColumns - firstRowColumns);
		totalFramesInGrid = (otherRowsColumns - firstRowColumns) + spriteSheet->GetTotalFrames();
	}
	else {
		// sprite forms a rectangle inside the sprite image
		// and the first frame is at the very beginning of this rectangle
		// EXAMPLE (x for sprite):
		// * * x x *
		// * * x x *
		// * * * * *
		// * * * * *
		// * * * * *

		frameInGrid = frame;
		totalFramesInGrid = spriteSheet->GetSpriteSheetWidth() / width * spriteSheet->GetSpriteSheetHeight() / height;
	}

	int columns = spriteSheet->GetSpriteSheetWidth() / width;
	int rows = (totalFramesInGrid*width) / spriteSheet->GetSpriteSheetWidth();

	int column = frameInGrid%columns;
	int row = rows == 1 ? 0 : frameInGrid / (columns);

	offsetX = spriteSheet->GetOffsetX() + column*width;
	offsetY = spriteSheet->GetOffsetY() + row*height;
}
