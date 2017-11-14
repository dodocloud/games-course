#pragma once


#include "SpriteSheetRenderer.h"
#include "Renderable.h"
#include "AphMain.h"


/**
* Rendering engine using a sprite sheet manager
*/
class Renderer {

protected:
	// buffer for z-indices of nodes that will be rendered a standard way
	map<int, vector<Renderable*>> zIndexImageBuffer;
	// buffer for z-indices of nodes that will be rendered using the SpriteSheetRenderer
	map<int, vector<Renderable*>> zIndexSheetBuffer;

	SpriteSheetRenderer* renderer = nullptr;
	// tile regularly filled with data and sent to sprite sheet renderer
	SpriteTile spriteTile;
	// layers used in sprite sheet renderer
	vector<string> rendererLayers;
	int virtualWidth = 0;
	int virtualHeight = 0;

public:
	Renderer() {
	}

	void OnInit();

	/**
	* Adds a new tile layer for sprite sheet renderer
	* @param img layer image
	* @param name name of the layer
	* @param bufferSize maximum number of sprites in the layer
	* @param zindex absolute z-index of the layer
	*/
	void AddTileLayer(ofImage* img, string name, int bufferSize, int zindex);

	/**
	* Removes tile layer by name
	*/
	void RemoveTileLayer(string name);

	/**
	* Clears all sprite buffers
	*/
	void ClearBuffers();

	SpriteSheetRenderer* GetSpriteSheetRenderer() const {
		return renderer;
	}

	/**
	* Pushes node that will be later rendered
	* together will all other nodes
	*/
	void PushNode(Renderable* node);

	/**
	* Begins the rendering procedure
	*/
	void BeginRender();

	/**
	* Ends the rendering procedure
	*/
	void EndRender();

	/**
	* Renders everything
	*/
	void Render();

	int GetVirtualWidth() const {
		return virtualWidth;
	}

	void SetVirtualWidth(int width) {
		this->virtualWidth = width;
	}

	int GetVirtualHeight() const {
		return virtualHeight;
	}

	void SetVirtualHeight(int height) {
		this->virtualHeight = height;
	}

protected:

	/**
	* Renders an image
	*/
	void RenderImage(Renderable* owner);

	/**
	* Renders a rectangle
	*/
	void RenderRectangle(Renderable* owner);

	/**
	* Renders a circle
	*/
	void RenderCircle(Renderable* owner);

	/**
	* Renders a text
	*/
	void RenderText(Renderable* owner);

	/**
	* Renders a sprite
	*/
	void RenderSprite(Renderable* owner);

	/**
	* Renders a multisprite (collection of sprites)
	*/
	void RenderMultiSprite(Renderable* owner);

	/**
	* Renders a label (text that is not affected by transformations)
	*/
	void RenderLabel(Renderable* owner);
};