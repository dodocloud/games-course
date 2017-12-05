#pragma once

#include <string>
#include <vector>
#include "ofRectangle.h"
#include "ofTrueTypeFont.h"
#include "ofImage.h"
#include "Transform.h"
#include "Sprite.h"
#include "BoundingBox.h"

using namespace std;

enum class MeshType {
	NONE,
	RECTANGLE,			// rectangle
	IMAGE,				// image
	LABEL,				// text not affected by transformations
	TEXT,				// text
	SPRITE,				// single sprite
	MULTISPRITE,		// collection of sprites
	CIRCLE				// circle
};

/**
* Base class for meshes
*/
class Renderable {
protected:
	Trans transform;
	MeshType meshType = MeshType::NONE;
	ofColor color;
	float width = 1;
	float height = 1;
	BoundingBox boundingBox = BoundingBox();
	bool isVisible = true;
public:


	Renderable() {
	}

	Renderable(MeshType meshType) : meshType(meshType) {

	}

	Renderable(MeshType meshType, float width, float height) : meshType(meshType), width(width), height(height) {

	}

	virtual ~Renderable() {

	}

	/**
	* Gets type of the mesh
	*/
	MeshType GetMeshType() const {
		return meshType;
	}

	ofColor GetColor() const {
		return color;
	}

	Trans& GetTransform() {
		return transform;
	}

	BoundingBox& GetBoundingBox() {
		return boundingBox;
	}

	void SetTransform(Trans& trans) {
		this->transform = trans;
	}

	void SetColor(ofColor color) {
		this->color = color;
	}

	virtual float GetWidth() const {
		return width;
	}

	virtual void SetWidth(float width) {
		this->width = width;
	}

	virtual float GetHeight() const {
		return height;
	}

	virtual void SetHeight(float height) {
		this->height = height;
	}

	bool IsVisible() const {
		return isVisible;
	}

	void SetIsVisible(bool isVisible) {
		this->isVisible = isVisible;
	}

	void UpdateBoundingBox();

	friend class GameObject;

};

/**
* Node rectangle
*/
class FRect : public Renderable {
private:
	// indicator, if only borders should be drawn
	bool noFill = false;
	// indicator, if the rectangle is renderable at all
	bool isRenderable = true;
public:
	FRect(float width, float height)
		: Renderable(MeshType::RECTANGLE, width, height) {
	}

	FRect(float width, float height, ofColor color)
		: Renderable(MeshType::RECTANGLE, width, height) {
		this->color = color;
	}

	/**
	* Gets indicator whether only borders should be drawn
	*/
	bool IsNoFill() const {
		return noFill;
	}

	/**
	* Sets the indicator whether only borders should be drawn
	*/
	void SetNoFill(bool noFill) {
		this->noFill = noFill;
	}

	/**
	* Gets indicator whether the rectangle is renderable
	*/
	bool IsRenderable() const {
		return isRenderable;
	}

	/**
	* Sets indicator whether the rectangle is renderable
	*/
	void SetIsRenderable(bool isRenderable) {
		this->isRenderable = isRenderable;
	}
};

/**
* Node circle
*/
class FCircle : public Renderable {
private:
	// indicator, if only borders should be drawn
	bool noFill = false;
public:
	FCircle(float radius)
		: Renderable(MeshType::CIRCLE, radius*2, radius*2) {
	}

	FCircle(float radius, ofColor color)
		: Renderable(MeshType::CIRCLE, radius * 2, radius * 2) {
		this->color = color;
	}

	FCircle(float radius, ofColor color, bool noFill)
		: Renderable(MeshType::CIRCLE, radius * 2, radius * 2) {
		this->color = color;
		this->noFill = noFill;
	}

	/**
	* Gets indicator whether only borders should be drawn
	*/
	bool IsNoFill() const {
		return noFill;
	}

	/**
	* Sets the indicator whether only borders should be drawn
	*/
	void SetNoFill(bool noFill) {
		this->noFill = noFill;
	}

	float GetRadius() const {
		return width / 2;
	}

	void SetRadius(float radius) {
		this->width = this->height = radius * 2;
	}
};

/**
* 2D image, wrapper for ofImage
*/
class ImageMesh : public Renderable {
private:
	ofImage* image;
public:

	ImageMesh(ofImage* img) : Renderable(MeshType::IMAGE) {
		this->image = img; 
	}


	ofImage* GetImage() const {
		return image;
	}

	void SetImage(ofImage* img) {
		this->image = img;
	}

	float GetWidth() const override {
		return image->getWidth();
	}

	float GetHeight() const override {
		return image->getHeight();
	}

	void SetWidth(float width) override {
		ofLogError("Mesh", "Width of mesh of type Image can't be changed!");
	}

	void SetHeight(float height) override {
		ofLogError("Mesh", "Height of mesh of type Image can't be changed!");
	}
};

/**
* 2D text
*/
class Text : public Renderable {
protected:
	ofTrueTypeFont* font;
	stringstream stream;
public:

	Text(ofTrueTypeFont* font) : Renderable(MeshType::TEXT) {
		this->font = font;
	}

	Text(ofTrueTypeFont* font, string& text) : Renderable(MeshType::TEXT) {
		this->font = font;
		stream << text;
	}

	ofTrueTypeFont* GetFont() const {
		return font;
	}

	void SetFont(ofTrueTypeFont* font) {
		this->font = font;
	}

	float GetWidth() const override {
		return GetTextWidth();
	}

	float GetHeight() const override {
		return GetTextHeight();
	}

	void SetWidth(float width) override {
		ofLogError("Mesh", "Width of mesh of type Text can't be changed!");
	}

	void SetHeight(float height) override {
		ofLogError("Mesh", "Height of mesh of type Text can't be changed!");
	}

	/**
	* Gets raster width of the current string
	*/
	float GetTextWidth() const {
		return font->stringWidth(stream.str());

	}

	/**
	* Gets raster height of the current string
	*/
	float GetTextHeight() const {
		// Height of Ay pair should cover the height
		// of all possible bounding boxes
		return font->stringHeight("Ay");
	}

	string GetText() const {
		return stream.str();
	}

	void SetText(string text) {
		stream.str("");
		stream << text;
	}

	void AppendText(string text) {
		stream << text;
	}

	void AppendLine(string text) {
		stream << text << endl;
	}
};

/**
* Text not affected by transformations
*/
class Label : public Text {
protected:
	int labelWidth;
public:

	/**
	* Creates a new label
	* @param font font of the label
	* @param text text of the label
	* @param labelWidth absolute width of the label in pixels
	*/
	Label(ofTrueTypeFont* font, string& text, int labelWidth) : Text(font, text) {
		this->meshType = MeshType::LABEL;
		this->labelWidth = labelWidth;
	}

	/**
	* Sets absolute label width in pixels
	*/
	void SetLabelWidth(int width) {
		this->labelWidth = width;
	}

	/**
	* Gets absolute label width in pixels
	*/
	int GetLabelWidth() const {
		return labelWidth;
	}

	ofTrueTypeFont* GetFont() const {
		return font;
	}

	void SetFont(ofTrueTypeFont* font) {
		this->font = font;
	}

	float GetWidth() const override {
		return 1;
	}

	float GetHeight() const override {
		return 1;
	}

	void SetWidth(float width) override {
		ofLogError("Mesh", "Width of mesh of type Label can't be changed!");
	}

	void SetHeight(float height) override {
		ofLogError("Mesh", "Height of mesh of type Label can't be changed!");
	}
};

/**
* 2D sprite that is a part of a spritesheet with given frame index
*/
class SpriteMesh : public Renderable {
private:
	// sprite entity
	Sprite sprite;
	// name of layer or sprite sheet this sprite belongs to
	string layerName;
public:

	SpriteMesh(const Sprite& sprite, string layerName)
		: Renderable(MeshType::SPRITE), sprite(sprite), layerName(layerName) {
	}

	/**
	* Gets name of layer or sprite sheet this sprite belongs to
	* Note that the name could differ from the name of original sprite sheet
	*/
	string GetLayerName() const {
		return layerName;
	}

	Sprite& GetSprite() {
		return sprite;
	}

	void SetSprite(Sprite sprite) {
		this->sprite = sprite;
	}


	float GetWidth() const override {
		return sprite.GetWidth();
	}

	float GetHeight() const override {
		return sprite.GetHeight();
	}

	void SetWidth(float width) override {
		ofLogError("Mesh", "Width of mesh of type Sprite can't be changed!");
	}

	void SetHeight(float height) override {
		ofLogError("Mesh", "Height of mesh of type Sprite can't be changed!");
	}
};

/**
*  Collection of sprites
*/
class MultiSpriteMesh : public Renderable {
private:
	vector<Sprite*> sprites;
	// name of the layer or sprite sheet this sprites belong to
	string layerName;

public:
	MultiSpriteMesh(string layerName)
		: Renderable(MeshType::MULTISPRITE), layerName(layerName) {
		width = 1;
		height = 1;
	}

	MultiSpriteMesh(string layerName, vector<Sprite*>& sprites)
		: Renderable(MeshType::MULTISPRITE), layerName(layerName), sprites(sprites) {
		width = 1;
		height = 1;
		Recalc();
	}

	vector<Sprite*>& GetSprites() {
		return sprites;
	}

	Sprite* GetSprite(int index) {
		return sprites[index];
	}

	int GetSpritesNum() const {
		return sprites.size();
	}

	/**
	* Recalculates size of this shape, according to the collection of sprites
	*/
	void Recalc();

	/**
	* Sorts all sprites by their z-index, starting with the furthest
	*/
	void RefreshZIndex();

	/**
	* Adds a new sprite	*/
	void AddSprite(Sprite* sprite) {
		sprites.push_back(sprite);
	}

	/**
	* Removes sprite
	*/
	void RemoveSprite(Sprite* sprite, bool erase = true) {
		auto found = find(sprites.begin(), sprites.end(), sprite);
		if (found != sprites.end()) {
			sprites.erase(found);
		}

		if(erase) {
			delete sprite;
		}
	}

	void RemoveAllSprites(bool erase = true) {
		if (erase) {
			for (auto& spr : sprites) {
				delete spr;
			}
		}
		sprites.clear();
	}

	string& GetLayerName() {
		return layerName;
	}

	/**
	* Gets width of the whole sprite set
	*/
	float GetWidth() const override {
		return static_cast<float>(width);
	}

	/**
	* Gets height of the whole sprite set
	*/
	float GetHeight() const override {
		return static_cast<float>(height);
	}

	void SetWidth(float width) override {
		ofLogError("Mesh", "Width of mesh of type MultiSprite can't be changed!");
	}

	void SetHeight(float height) override {
		ofLogError("Mesh", "Height of mesh of type MultiSprite can't be changed!");
	}
};