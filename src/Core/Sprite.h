#pragma once


#include "SpriteSheet.h"
#include "Transform.h"

/**
* Sprite entity, a part of a texture image called sprite sheet
* Identified by frame index, pointing to the area on the sheet
*/
class Sprite {
private:
	int frame;		// frame index
	int offsetX;	// x-axis offset on sprite sheet 
	int offsetY;	// y-axis offset on sprite sheet
	int width;		// width in pixels
	int height;		// height in pixels
	Trans transform = Trans(0, 0);
	SpriteSheet* spriteSheet;	// pointer to parent sprite sheet

public:

	/**
	* Creates a new sprite
	* @param spriteSheet collection of sprites
	* @param row index of a row in which this sprite is located
	* @param column index of a column in which this sprite is located
	*/
	Sprite(SpriteSheet* spriteSheet, int row, int column);

	/**
	* Creates a new sprite
	* @param spriteSheet collection of sprites
	* @param frame index of a frame on the sprite sheet
	*/
	Sprite(SpriteSheet* spriteSheet, int frame);

	/**
	* Creates a new sprite
	* @param spriteSheet collection of sprites
	* @param row index of a row in which this sprite is located
	* @param column index of a column in which this sprite is located
	* @param transform sprite transformation
	*/
	Sprite(SpriteSheet* spriteSheet, int row, int column, Trans& transform);

	/**
	* Creates a new sprite
	* @param spriteSheet collection of sprites
	* @param frame index of a frame on the sprite sheet
	* @param transform sprite transformation
	*/
	Sprite(SpriteSheet* spriteSheet, int frame, Trans& transform);

	int GetFrame() const {
		return frame;
	}

	void SetFrame(int frame) {
		this->frame = frame;
		this->Recalc();
	}

	/**
	 * Gets x-axis offset on sprite sheet in pixels
	 */
	int GetOffsetX() const {
		return offsetX;
	}

	/**
	* Gets y-axis offset on sprite sheet in pixels
	*/
	int GetOffsetY() const {
		return offsetY;
	}

	/**
	 * Gets width of the sprite in pixels
	 */
	int GetWidth() const {
		return width;
	}

	/**
	 * Gets height of the sprite in pixels
	 */
	int GetHeight() const {
		return height;
	}

	/**
	 * Gets transformation entity
	 */
	Trans& GetTransform() {
		return transform;
	}

	/**
	 * Gets z-index
	 */
	int GetZIndex() const {
		return static_cast<int>(transform.localPos.z);
	}


protected:
	/**
	* Recalculates attributes (width, height), according to values in sprite sheet
	*/
	void Recalc();
};
