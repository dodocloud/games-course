#pragma once

#include "ofTexture.h"


/**
* Flip direction of the rendered tile
*/
enum FlipDirection {
	NONE = 0,
	HORIZONTALLY = 1,
	VERTICALLY = 2,
	HORIZ_VERT = 3
};

/**
* Node sprite with given transform and texture coordinates
*/
struct SpriteTile {

	SpriteTile() {
		offsetX = 0;
		offsetY = 0;
		width = 0;
		height = 0;
		posX = 0;
		posY = 0;
		posZ = 0;
		dir = FlipDirection::NONE;
		scaleX = 1;
		scaleY = 1;
		rotation = 0;
		col = ofColor(255);
	}

	// x offset in pixels on a texture
	int offsetX;
	// y offset in pixels on a texture
	int offsetY;
	// tile width
	int width;
	// tile height
	int height;

	// absolute position on the x axis
	float posX;
	// absolute position on the y axis
	float posY;
	// absolute position on the z axis
	float posZ;
	// flip direction
	FlipDirection dir;
	// absolute x-axis scale 
	float scaleX;
	// absolute y-axis scale
	float scaleY;
	// rotation in degrees
	float rotation;
	// tile color
	ofColor col;
};

/**
* Buffer for one rendered layer, contains vertex data
*/
struct SpriteLayer {
	// z-index of the layer
	int zIndex;
	// layer name
	string name;
	// texture x-axis coefficient (equal to 1 for non opengl-es cards) 
	float textureCoeffX;
	// texture y-axis coefficient (equal to 1 for non opengl-es card)
	float textureCoeffY;
	// indicator whether the texture is external (and therefore it shouldn't be deleted)
	bool textureIsExternal;
	// pointer to texture
	ofTexture* texture;
	// vertex data
	float* verts;
	// texture coordinates data
	float* coords;
	// color data
	unsigned char * colors;

	// size of the buffer
	int bufferSize;
	// total number of sprites
	int numSprites;

	SpriteLayer(int zIndex) : zIndex(zIndex) {
		texture = nullptr;
		verts = nullptr;
		coords = nullptr;
		colors = nullptr;
		bufferSize = 0;

		textureIsExternal = false;
	}

	~SpriteLayer() {
		if (texture != nullptr) {
			if (textureIsExternal) texture->clear();
			else delete texture;
		}

		if (verts != nullptr)
			delete[] verts;
		if (coords != nullptr)
			delete[] coords;
		if (colors != nullptr)
			delete[] colors;
	}
};

/**
 * Class that renders sprites using OpenGL api
 */
class SpriteSheetRenderer {
protected:
	float brushX;
	float brushY;
	map<string, SpriteLayer*> buffers;
	SpriteLayer* actualBuffer;
public:

	SpriteSheetRenderer();
	~SpriteSheetRenderer();

	/**
	* Pastes sprite image to the texture under the buffer with given name
	* Note that there must be a SpriteTexture associated with the given sheet
	* @param fileName path to the image
	* @param sheetName name of a sheet
	* @param x x coordinate of the pasted image
	* @param y y coordinate of the pasted image
	* @param glType opengl type (GL_RGB or GL_RGBA)
	*/
	void PasteSpriteTexture(string fileName, string sheetName, int x, int y, int glType = GL_RGBA);

	/**
	* Loads a texture
	* @param texture texture to load
	* @param sheetName name of the sheet
	* @param bufferSize maximum number of sprites for this buffer
	* @param zIndex z-index of the layer
	* @param isExternal indicator whether this texture is external and therefore it shouldn't be deleted
	*/
	void LoadTexture(ofTexture * texture, string sheetName, int bufferSize, int zIndex, bool isExternal = true);

	/**
	* Reallocates buffer with given name to the new size
	* @param sheetName name of the sheet to reallocate
	* @param bufferSize new size of the buffer
	*/
	void ReallocateBuffer(string sheetName, int bufferSize);

	/**
	* Adds a tile into the actual buffer
	*/
	bool AddTile(SpriteTile& tile);

	/**
	* Adds a rectangle into the actual buffer
	* @param x x coordinate
	* @param y y coordinate
	* @param z z coordinate
	* @param w width
	* @param h height
	* @param scale absolute scale
	* @param rot rotation
	* @param col rectangle color
	*/
	bool AddRect(float x, float y, float z, float w, float h, float scale, float rot, ofColor& col);

	/**
	* Clears counter of sprites of given sheet
	*/
	void ClearCounters(string sheetName);

	/**
	* Clears texture of given sheet
	*/
	void ClearTexture(string sheetName);

	/**
	* Sets actual buffer that will be drawn
	*/
	void SetActualBuffer(string sheetName);

	/**
	* Draws the actual buffer
	*/
	void Draw();

protected:

	// calculates X-coordinate on the texture according to the angle
	inline float GetX(float x, float y, float angle) {
		return (angle == 0) ? x : ((float)x*cosf(angle) - (float)y*sinf(angle));
	}

	// calculates Y-coordinate on the texture according to the angle
	inline float GetY(float x, float y, float angle) {
		return (angle == 0) ? y : ((float)x*sinf(angle) + (float)y*cosf(angle));
	}

	/**
	* Adds texture coordinates of the given tile into the actual buffer
	*/
	void AddTexCoords(SpriteTile& tile);

	/**
	* Adds given texture coordinates
	*/
	void AddTexCoords(FlipDirection f, float posX, float posY, float x = 1, float y = 1);

	/**
	* Ads texture coordinates to the current texture array
	*/
	void AddTexCoords(int offset, float x1, float y1, float x2, float y2);

	/**
	* Sets texture coefficients
	*/
	void SetTexCoeffs(int textureWidth, int textureHeight);

	/**
	* Creates vertices from tile
	*/
	void MakeQuad(int offset, SpriteTile& tile);

	/**
	* Creates vertices (two triangles) from given parameters
	*/
	void MakeQuad(int offset, float x1, float y1, float z1, float x2, float y2, float z2,
		float x3, float y3, float z3, float x4, float y4, float z4);

	/**
	* Creates color vertices
	*/
	void MakeColorQuad(int offset, ofColor& col);

	inline int GetVertexOffset() {
		return  (actualBuffer->numSprites) * 18;
	}

	inline int GetColorOffset() {
		return (actualBuffer->numSprites) * 24;
	}

	inline int GetCoordOffset() {
		return (actualBuffer->numSprites) * 12;
	}
};
