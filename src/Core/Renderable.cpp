#include "Renderable.h"
#include "ofRectangle.h"

void Renderable::UpdateBoundingBox() {
	auto absPos = ofVec2f(this->transform.absPos.x, this->transform.absPos.y);
	this->boundingBox.topLeft = absPos;
	this->boundingBox.topRight = ofVec2f(absPos.x + this->GetWidth() * this->transform.absScale.x, absPos.y);
	this->boundingBox.bottomLeft = ofVec2f(absPos.x, absPos.y + this->GetHeight() * this->transform.absScale.y);
	this->boundingBox.bottomRight = ofVec2f(this->boundingBox.bottomLeft.x + this->GetWidth()* this->transform.absScale.x, this->boundingBox.bottomLeft.y);
}

void MultiSpriteMesh::Recalc() {

	int minX = 0;
	int minY = 0;
	int maxX = 0;
	int maxY = 0;
	int mWidth = 0;
	int mHeight = 0;

	for(int i=0; i<sprites.size(); i++) {
		Sprite* spr = sprites[i];
		Trans& transform = spr->GetTransform();

		int posX = (int)transform.localPos.x;
		int posY = (int)transform.localPos.y;

		if (posX < minX) minX = posX;
		if (posY < minY) minY = posY;

		if (posX > maxX) {
			maxX = posX;
			mWidth = spr->GetWidth();
		}

		if (posY > maxY) {
			maxY = posY;
			mHeight = spr->GetHeight();
		}
	}

	// set size of bounding box of all sprite coordinates
	this->width = (maxX - minX) + mWidth;
	this->height = (maxY - minY) + mHeight;

	RefreshZIndex();
}

void MultiSpriteMesh::RefreshZIndex() {
	sort(sprites.begin(), sprites.end(),
		[](const Sprite*  a, const Sprite* b) -> bool {
		return a->GetZIndex() < b->GetZIndex();
	});
}
