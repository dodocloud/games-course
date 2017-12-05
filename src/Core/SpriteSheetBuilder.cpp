#include "SpriteSheetBuilder.h"
#include "SpriteSheet.h"
#include "jsonxx.h"

void SpriteSheetBuilder::LoadFromJson(jsonxx::Object& obj) {

	this->name = obj.get<jsonxx::String>("name");

	if (obj.has<jsonxx::Number>("offset_px_x")) {
		this->offsetPxX = obj.get<jsonxx::Number>("offset_px_x", 0);
		this->offsetPxY = obj.get<jsonxx::Number>("offset_px_y", 0);
	}
	else {
		this->offsetBlockX = obj.get<jsonxx::Number>("offset_x", 0);
		this->offsetBlockY = obj.get<jsonxx::Number>("offset_y", 0);
	}

	this->spriteWidth = obj.get<jsonxx::Number>("sprite_size_x", 0);
	this->spriteHeight = obj.get<jsonxx::Number>("sprite_size_y", 0);
	this->totalFrames = obj.get<jsonxx::Number>("frames", 1);
}

SpriteSheet* SpriteSheetBuilder::BuildAndReset() {
	auto output = Build();
	InitValues();
	return output;
}

SpriteSheet* SpriteSheetBuilder::Build() {
	if (image == nullptr) {
		throw std::invalid_argument("Image not loaded");
	}

	// 1) get size of the whole sprite atlas
	int spriteAtlasWidth = image->getWidth();
	int spriteAtlasHeight = image->getHeight();

	int offsetX;
	int offsetY;

	// 2) calculate offsets
	if (offsetPxX == 0 && offsetPxY == 0) {
		offsetX = offsetBlockX*spriteWidth;
		offsetY = offsetBlockY*spriteHeight;
	}
	else {
		offsetX = offsetPxX;
		offsetY = offsetPxY;
	}

	if (spriteSheetWidth == 0 && spriteSheetHeight == 0) {
		// 3) calculate size of the sprite sheet

		if (totalFrames == 0) {
			// take the whole area
			this->spriteSheetWidth = spriteAtlasWidth - offsetX;
			this->spriteSheetHeight = spriteAtlasHeight - offsetY;
		}
		else {
			// this is more difficult -> we need to calculate the size
			// according to the number of frames

			auto areaWidth = spriteAtlasWidth - offsetX;

			if (spriteWidth == 0 || spriteHeight == 0) {
				// sprite size not specified -> calculate it from size of the area
				spriteWidth = areaWidth / totalFrames;
				spriteHeight = spriteAtlasHeight - offsetY;
			}

			int maxFramesPerRow = areaWidth / spriteWidth;

			if (maxFramesPerRow >= totalFrames) {
				// sprites are at only one row
				this->spriteSheetWidth = totalFrames * spriteWidth;
				this->spriteSheetHeight = spriteHeight;
			}
			else {
				// sprites are divided into more than one row
				int rows = totalFrames / maxFramesPerRow;
				this->spriteSheetWidth = spriteWidth * maxFramesPerRow;
				this->spriteSheetHeight = spriteHeight * rows;
			}
		}
	}

	if (spriteWidth == 0 || spriteHeight == 0) {
		// sprite size is not specified -> there is only one sprite
		spriteWidth = this->spriteSheetWidth;
		spriteHeight = this->spriteSheetHeight;
	}

	if (spriteSheetWidth == 0 && spriteSheetHeight == 0 && totalFrames == 0) {
		throw std::invalid_argument("Either size of the sprite sheet or number of total frames has to be set!");
	}

	int columns;
	int rows;

	if (totalFrames == 0) {
		// try to calculate number of frames from the size of the sprite sheet
		if ((spriteSheetWidth % spriteWidth) != 0 || (spriteSheetHeight % spriteHeight) != 0) {
			throw std::invalid_argument("The size of the sprite sheet should be a multiple of the sprite size.");
		}

		columns = spriteSheetWidth % spriteWidth;
		rows = spriteSheetHeight % spriteHeight;
		this->totalFrames = columns * rows;
	}

	// and there we go
	SpriteSheet* output = new SpriteSheet(image, name, offsetX, offsetY, totalFrames, spriteWidth, spriteHeight, spriteSheetWidth, spriteSheetHeight);


	return output;
}