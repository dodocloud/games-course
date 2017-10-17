#pragma once

#include <string>
#include "ofImage.h"

using namespace std;



/**
* Collection of sprites that are a part of a sprite atlas
* Each sprite atlas may contain more sprite shets with different names, on different offset and
* with various frames.
*
* It is suitable for animations where each animated object has its all frames on one sprite sheet
*/
class SpriteSheet {
private:
	int offsetX;		// x-axis offset in sprite atlas in pixels
	int offsetY;		// y-axis offset in sprite atlas in pixels
	int totalFrames;	// number of frames this sprite sheet contains
	int spriteWidth;	// width of one sprite in pixels
	int spriteHeight;	// height of one sprite in pixels
	int spriteSheetWidth; // width of the whole sprite sheet in pixels
	int spriteSheetHeight;// height of the whole sprite sheet in pixels

	// pointer to the sprite sheet
	ofImage* spriteAtlas;

	// width of the sprite sheet
	int spriteAtlasWidth;
	// height of the sprite sheet
	int spriteAtlasHeight;
	// name of this sprite set
	string name;

public:

	/**
	* Creates a new sprite sheet
	* @param spriteAtlas sprite atlas in which this sheet comprises
	* @param name name of the sprite sheet
	* @param totalFrames number of frames in the sheet
	* @param spriteWidth width of one sprite in pixels
	* @param spriteHeight height of one sprite in pixels
	*/
	SpriteSheet(ofImage* spriteAtlas, string name, int totalFrames,
		int spriteWidth, int spriteHeight);

	/**
	* Creates a new sprite sheet
	* @param spriteAtlas sprite atlas in which this sheet comprises
	* @param name name of the sheet
	* @param totalFrames number of frames in the sheet
	* @param spriteWidth width of one sprite in pixels
	* @param spriteHeight height of one sprite in pixels
	* @param spriteSheetWidth width of the whole sprite sheet in pixels
	* @param spriteSheetHeight height of the whole sprite sheet in pixels
	*/
	SpriteSheet(ofImage* spriteAtlas, string name, int totalFrames,
		int spriteWidth, int spriteHeight, int spriteSheetWidth, int spriteSheetHeight);

	/**
	* Creates a new sprite sheet
	* @param spriteAtlas sprite atlas in which this sheet comprises
	* @param name name of the sheet
	* @param offsetX position in the atlas on the x axis where the sprite sheet starts
	* @param offsetY position in the atlas on the y axis where the sprite sheet starts
	* @param totalFrames number of frames in the sheet
	* @param spriteWidth width of one sprite in pixels
	* @param spriteHeight height of one sprite in pixels
	* @param spriteSheetWidth width of the whole sprite sheet in pixels
	* @param spriteSheetHeight height of the whole sprite sheet in pixels
	*/
	SpriteSheet(ofImage* spriteAtlas, string name, int offsetX, int offsetY, int totalFrames,
		int spriteWidth, int spriteHeight, int spriteSheetWidth, int spriteSheetHeight);

	/**
	 * Gets sprite sheet image
	 */
	ofImage* GetSpriteAtlas() {
		return spriteAtlas;
	}

	/**
	 * Gets name of this sprite sheet
	 */
	string GetName() const {
		return name;
	}

	/**
	 * Gets x-axis offset int sprite atlas in pixels
	 */
	int GetOffsetX() const {
		return offsetX;
	}

	/**
	* Gets y-axis offset in sprite atlas in pixels
	*/
	int GetOffsetY() const {
		return offsetY;
	}

	/**
	 * Gets number of frames in the sheet
	 */
	int GetTotalFrames() const {
		return totalFrames;
	}

	/**
	 * Gets width of one sprite
	 */
	int GetSpriteWidth() const {
		return spriteWidth;
	}

	/**
	 * Gets height of one sprite
	 */
	int GetSpriteHeight() const {
		return spriteHeight;
	}

	/**
	 * Gets width of this sprite sheet
	 */
	int GetSpriteSheetWidth() const {
		return spriteSheetWidth;
	}

	/**
	 * Gets height of this sprite sheet
	 */
	int GetSpriteSheetHeight() const {
		return spriteSheetHeight;
	}

	/**
	 * Gets width of the sprite atlas
	 */
	int GetSpriteAtlasWidth() const {
		return spriteAtlasWidth;
	}

	/**
	 * Gets height of the sprite atlas
	 */
	int GetSpriteAtlasHeight() const {
		return spriteAtlasHeight;
	}
};
