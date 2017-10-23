#include "Renderer.h"
#include "ofGraphics.h"
#include "Renderable.h"
#include "ofxTextLabel.h"
#include "Transform.h"

void Renderer::OnInit() {
	zIndexImageBuffer = map<int, vector<Renderable*>>();
	zIndexSheetBuffer = map<int, vector<Renderable*>>();
	renderer = new SpriteSheetRenderer();
	rendererLayers = vector<string>();

	if(virtualWidth == 0 || virtualHeight == 0) {
		virtualWidth = ofGetWindowWidth();
		virtualHeight = ofGetWindowHeight();
	}
}


void Renderer::AddTileLayer(ofImage* img, string name, int bufferSize, int zindex) {
	renderer->LoadTexture(&img->getTexture(), name, bufferSize, zindex);
	rendererLayers.push_back(name);
}

void Renderer::RemoveTileLayer(string name) {
	auto layer = find(rendererLayers.begin(), rendererLayers.end(), name);
	if (layer != rendererLayers.end()) rendererLayers.erase(layer);

	renderer->ClearTexture(name);
}

void Renderer::ClearBuffers() {
	zIndexImageBuffer = map<int, vector<Renderable*>>();
	zIndexSheetBuffer = map<int, vector<Renderable*>>();
}

void Renderer::PushNode(Renderable* node) {
	if (node->IsVisible()) {
		auto renderType = node->GetMeshType();
		auto& buffer = (renderType == MeshType::SPRITE || renderType == MeshType::MULTISPRITE)
			? zIndexSheetBuffer : zIndexImageBuffer;


		Trans& tr = node->GetTransform();
		// zIndex will be taken always from local position
		int zIndex = (int)(tr.localPos.z);

		auto it = buffer.find(zIndex);
		if (it != buffer.end()) {
			(*it).second.push_back(node);
		}
		else {
			buffer[zIndex].push_back(node);
		}
	}
}

void Renderer::BeginRender() {
	// set projection and clear background with black color
	ofSetupScreenOrtho(virtualWidth, virtualHeight, -1000.0f, 1000.0f);
	ofBackground(0);

	// init viewport
	int screenWidth = ofGetWindowWidth();
	int screenHeight = ofGetWindowHeight();

	// handle custom aspect ratio
	if (virtualWidth != screenWidth) {
		ofViewport((screenWidth - virtualWidth) / 2, 0, (float)virtualWidth, (float)virtualHeight);
	}
	else if (virtualHeight != screenHeight) {
		ofViewport(0, (screenHeight - virtualHeight) / 2, (float)virtualWidth, (float)virtualHeight);
	}
	else {
		// back to actual viewport
		ofViewport(0, 0, virtualWidth, virtualHeight);
	}
}

void Renderer::EndRender() {
	ofVec2f screenSize = ofGetWindowSize();

	ofLoadMatrix(ofMatrix4x4::newIdentityMatrix());
	ofSetColor(0);

	// draw black rectangles that will cover oversized viewport
	if (virtualWidth != screenSize.x) {
		// draw left and right
		ofViewport(0.0f, 0.0f, (screenSize.x - virtualWidth) / 2, virtualHeight);
		ofDrawRectangle(0.0f, 0.0f, screenSize.x, screenSize.y);
		ofViewport(screenSize.x - (screenSize.x - virtualWidth) / 2, 0.0f, (screenSize.x - virtualWidth) / 2, virtualHeight);
		ofDrawRectangle(0.0f, 0.0f, screenSize.x, screenSize.y);

		// back to actual viewport
		ofViewport((screenSize.x - virtualWidth) / 2, 0.0f, virtualWidth, virtualHeight);
	}
	else if (virtualHeight != screenSize.y) {
		// draw top and bottom
		ofViewport(0.0f, 0.0f, virtualWidth, (screenSize.y - virtualHeight) / 2);
		ofDrawRectangle(0.0f, 0.0f, screenSize.x, screenSize.y);
		ofViewport(0.0f, screenSize.y - (screenSize.y - virtualHeight) / 2, virtualWidth, (screenSize.y - virtualHeight) / 2);
		ofDrawRectangle(0.0f, 0.0f, screenSize.x, screenSize.y);
		// back to actual viewport
		ofViewport((screenSize.x - virtualWidth) / 2, 0.0f, virtualWidth, virtualHeight);
	}
}


void Renderer::Render() {

	if (rendererLayers.size() != 0) {

		// reset all layers
		for (auto it = rendererLayers.begin(); it != rendererLayers.end(); ++it) {
			renderer->ClearCounters((*it));
		}

		// draw sprites
		for (auto it = zIndexSheetBuffer.begin(); it != zIndexSheetBuffer.end(); ++it) {

			vector<Renderable*>& arr = (*it).second;

			for (auto it2 = arr.begin(); it2 != arr.end(); ++it2) {
				Renderable* node = (*it2);

				switch (node->GetMeshType()) {
				case MeshType::IMAGE:
				case MeshType::RECTANGLE:
				case MeshType::TEXT:
				case MeshType::LABEL:
					ofLogError("Trying to render non-sprite node with sprite sheet renderer!");
					break;
				case MeshType::SPRITE:
					RenderSprite(node);
					break;
				case MeshType::MULTISPRITE:
					RenderMultiSprite(node);
					break;
				}
			}
		}

		// call sprite sheet renderer at the very end
		ofLoadMatrix(ofMatrix4x4::newIdentityMatrix());
		ofFill();
		renderer->Draw();
	}

	// draw images, planes, texts and labels
	for (auto it = zIndexImageBuffer.begin(); it != zIndexImageBuffer.end(); ++it) {

		vector<Renderable*>& arr = (*it).second;

		for (auto it2 = arr.begin(); it2 != arr.end(); ++it2) {
			Renderable* node = (*it2);

			switch (node->GetMeshType()) {
			case MeshType::IMAGE:
				RenderImage(node);
				break;
			case MeshType::RECTANGLE:
				RenderRectangle(node);
				break;
			case MeshType::TEXT:
				RenderText(node);
				break;
			case MeshType::LABEL:
				RenderLabel(node);
				break;
			case MeshType::SPRITE:
			case MeshType::MULTISPRITE:
				ofLogError("Trying to render sprite node with default renderer!");
			}
		}
	}
}

void Renderer::RenderImage(Renderable* owner) {
	// load absolute matrix
	ofMatrix4x4 absM = owner->GetTransform().CalcAbsMatrix();
	ofLoadMatrix(absM);

	ofSetColor(0x000000ff);
	ImageMesh* imgShp = dynamic_cast<ImageMesh*>(owner);
	auto image = imgShp->GetImage();
	image->draw(0, 0);
}

void Renderer::RenderRectangle(Renderable* owner) {
	Rect* rect = dynamic_cast<Rect*>(owner);

	if (rect->IsRenderable()) {
		// calc absolute matrix
		ofMatrix4x4 absM = owner->GetTransform().CalcAbsMatrix();
		ofLoadMatrix(absM);

		ofSetColor(0x000000ff);


		ofColor color = rect->GetColor();
		ofSetColor(color);


		if (rect->IsNoFill()) {
			// render just border
			ofNoFill();
			ofSetLineWidth(1);
		}
		else {
			ofFill();
			ofSetLineWidth(0);
		}

		ofRect(0, 0, 0, rect->GetWidth(), rect->GetHeight());
	}
}

void Renderer::RenderText(Renderable* owner) {
	// load absolute matrix
	ofMatrix4x4 absM = owner->GetTransform().CalcAbsMatrix();
	ofLoadMatrix(absM);
	auto shape = dynamic_cast<Text*>(owner);
	ofSetColor(shape->GetColor());

	ofTrueTypeFont* font = shape->GetFont();
	font->drawString(shape->GetText(), 0, font->getLineHeight() / 2);
}

void Renderer::RenderSprite(Renderable* owner) {

	auto shape = dynamic_cast<SpriteMesh*>(owner);
	Sprite& sprite = shape->GetSprite();
	Trans& trans = owner->GetTransform();
	renderer->SetActualBuffer(shape->GetLayerName());

	// fill tile with  data and send it to the sprite manager
	spriteTile.width = sprite.GetWidth();
	spriteTile.height = sprite.GetHeight();
	spriteTile.offsetX = sprite.GetOffsetX();
	spriteTile.offsetY = sprite.GetOffsetY();

	spriteTile.posX = trans.absPos.x + trans.absScale.x*spriteTile.width / 2.0f;  // [0,0] is topleft corner
	spriteTile.posY = trans.absPos.y + trans.absScale.y*spriteTile.height / 2.0f;
	spriteTile.posZ = trans.absPos.z;
	spriteTile.rotation = trans.rotation*DEG_TO_RAD;
	spriteTile.scaleX = trans.absScale.x;
	spriteTile.scaleY = trans.absScale.y;

	renderer->AddTile(spriteTile);
}

void Renderer::RenderMultiSprite(Renderable* owner) {

	// Multi-sprites are clear choice when drawing thousands of objects, because they 
	// are all rendered at once 

	auto shape = dynamic_cast<MultiSpriteMesh*>(owner);
	renderer->SetActualBuffer(shape->GetLayerName());

	auto& sprites = shape->GetSprites();
	Trans& ownerTransform = owner->GetTransform();

	// calc absolute transform
	for (int i = 0; i < sprites.size(); i++) {
		sprites[i]->GetTransform().CalcAbsTransform(ownerTransform);
	}

	for (int i = 0; i < sprites.size(); i++) {
		Sprite* sprite = sprites[i];
		Trans& trans = sprite->GetTransform();

		spriteTile.width = sprite->GetWidth();
		spriteTile.height = sprite->GetHeight();
		spriteTile.offsetX = sprite->GetOffsetX();
		spriteTile.offsetY = sprite->GetOffsetY();

		spriteTile.posX = trans.absPos.x + trans.absScale.x*spriteTile.width / 2.0f;  // [0,0] is topleft corner
		spriteTile.posY = trans.absPos.y + trans.absScale.y*spriteTile.height / 2.0f;
		spriteTile.posZ = trans.absPos.z;
		spriteTile.rotation = trans.rotation*DEG_TO_RAD;
		spriteTile.scaleX = trans.absScale.x;
		spriteTile.scaleY = trans.absScale.y;

		renderer->AddTile(spriteTile);
	}
}

void Renderer::RenderLabel(Renderable* owner) {

	auto& trans = owner->GetTransform();

	// label doesn't depend on transform !
	ofLoadMatrix(ofMatrix4x4::newIdentityMatrix());

	auto shape = dynamic_cast<Label*>(owner);
	ofSetColor(shape->GetColor());

	auto font = shape->GetFont();

	vector<string> textLines;
	ofRectangle textBounds = ofRectangle();
	// use absolute positions
	ofRectangle drawBounds = ofRectangle(trans.absPos.x, trans.absPos.y, shape->GetLabelWidth(), ofGetWindowHeight() - trans.absPos.y);
	ofxTextLabel::stringToLines(*font, shape->GetText(), drawBounds.width, textLines, textBounds);
	auto text = shape->GetText();

	// draw lines one by one and calculate offsets for each line
	float lineX, lineY;
	lineX = drawBounds.x;
	lineY = drawBounds.y;
	int counter = 0;

	// a little hack -> measure height of the text according to the height of "Ay" word that should cover all possible letters
	int lineHeight = font->stringHeight("Ay");
	int linesToDraw = (drawBounds.height / (1.5f*lineHeight));
	int startingIndex = textLines.size() - linesToDraw;
	if (startingIndex < 0) startingIndex = 0;

	// draw only lines that should be drawn
	for (auto it = (textLines.begin() + startingIndex); it != textLines.end(); ++it) {
		if (counter++ == 0) {
			lineY += font->stringHeight("Ay");  // easiest way to get ascender height.
		}
		else {
			lineY += font->getLineHeight();
		}

		font->drawString(*it, lineX, lineY);
	}
}