#include "SpriteSheetRenderer.h"
#include "AphUtils.h"


SpriteSheetRenderer::SpriteSheetRenderer() {
	buffers = map<string, SpriteLayer*>();
	actualBuffer = nullptr;
}

SpriteSheetRenderer::~SpriteSheetRenderer() {
	for (auto& buf : buffers) {
		delete buf.second;
	}
}


void SpriteSheetRenderer::LoadTexture(ofTexture * texture, string sheetName, int bufferSize, int zIndex, bool isExternal) {
	if (buffers.count(sheetName) == 0) {
		buffers[sheetName] = new SpriteLayer(zIndex);
	}

	ClearCounters(sheetName);
	ClearTexture(sheetName);
	ReallocateBuffer(sheetName, bufferSize);
	actualBuffer->textureIsExternal = isExternal;
	actualBuffer->texture = texture;
	SetTexCoeffs(texture->getWidth(), texture->getHeight());
}

void SpriteSheetRenderer::ReallocateBuffer(string sheetName, int bufferSize) {
	SetActualBuffer(sheetName);

	actualBuffer->bufferSize = bufferSize;

	if (actualBuffer->verts != nullptr)
		delete[] actualBuffer->verts;
	if (actualBuffer->coords != nullptr)
		delete[] actualBuffer->coords;
	if (actualBuffer->colors != nullptr)
		delete[] actualBuffer->colors;

	// 18 vertices for one quad (2 triangles and 3 axis -> 2*3*3)
	actualBuffer->verts = new float[actualBuffer->bufferSize * 18];
	// 12 texture coordinates for one quad (2 triangles and 2 axis -> 2*3*2)
	actualBuffer->coords = new float[actualBuffer->bufferSize * 12];
	// 24 colors for one quad (2 triangles and 4 channels -> 2*3*4)
	actualBuffer->colors = new unsigned char[actualBuffer->bufferSize * 24];

	actualBuffer->numSprites = 0;

	ClearCounters(sheetName);
	ClearTexture(sheetName);
}

bool SpriteSheetRenderer::AddTile(SpriteTile& tile) {
	if (actualBuffer == nullptr || actualBuffer->texture == nullptr) {
		ofLogError("Cannot add tile since there is no texture loaded");
		return false;
	}

	if (actualBuffer->numSprites >= actualBuffer->bufferSize) {
		ofLogError(string_format("Texture buffer overflown! Maximum number of sprites is set to %d", actualBuffer->bufferSize));
		return false;
	}

	int vertexOffset = GetVertexOffset();
	int colorOffset = GetColorOffset();

	AddTexCoords(tile);
	MakeQuad(vertexOffset, tile);
	MakeColorQuad(colorOffset, tile.col);

	actualBuffer->numSprites++;

	return true;
}

bool SpriteSheetRenderer::AddRect(float x, float y, float z, float w, float h, float scale, float rot, ofColor& col) {

	if (actualBuffer == nullptr || actualBuffer->texture == nullptr) {
		ofLogError("Cannot add tile since there is no texture loaded");
		return false;
	}

	if (actualBuffer->numSprites >= actualBuffer->bufferSize) {
		ofLogError(string_format("Texture buffer overflown! Maximum number of sprites is set to %d", actualBuffer->bufferSize));
		return false;
	}

	int vertexOffset = GetVertexOffset();
	int colorOffset = GetColorOffset();
	int coordOffset = GetCoordOffset();

	w = w*scale / 2;
	h = h*scale / 2;

	// create vertices
	MakeQuad(vertexOffset, x + GetX(-w, -h, rot), y + GetY(-w, -h, rot), z,
		x + GetX(w, -h, rot), y + GetY(w, -h, rot), z,
		x + GetX(-w, h, rot), y + GetY(-w, h, rot), z,
		x + GetX(w, h, rot), y + GetY(w, h, rot), z);

	MakeColorQuad(colorOffset, col);
	int halfBrushSize = actualBuffer->textureCoeffX / 2;
	AddTexCoords(coordOffset, brushX + halfBrushSize, brushY + halfBrushSize, brushX + halfBrushSize, brushY + halfBrushSize);
	actualBuffer->numSprites++;
	return true;
}

void SpriteSheetRenderer::ClearCounters(string sheetName) {
	SetActualBuffer(sheetName);
	actualBuffer->numSprites = 0;
}

void SpriteSheetRenderer::ClearTexture(string sheetName) {
	SetActualBuffer(sheetName);

	if (actualBuffer->texture != nullptr) {
		if (actualBuffer->textureIsExternal)
			actualBuffer->texture = nullptr;
		else {
			delete actualBuffer->texture;
			actualBuffer->texture = nullptr;
		}
	}
}


void SpriteSheetRenderer::SetActualBuffer(string sheetName) {
	auto buff = buffers.find(sheetName);

	if (buff != buffers.end()) actualBuffer = buff->second;
	else actualBuffer = nullptr;
}

void SpriteSheetRenderer::Draw() {
	glEnableClientState(GL_VERTEX_ARRAY);
	glEnableClientState(GL_COLOR_ARRAY);
	glEnableClientState(GL_TEXTURE_COORD_ARRAY);

	// copy layers into vector and sort it by z-index
	vector<SpriteLayer*> buffs;

	for (auto& it : buffers) {
		buffs.push_back(it.second);
	}

	sort(buffs.begin(), buffs.end(),
		[](const SpriteLayer*  a, const SpriteLayer* b) -> bool {
		return a->zIndex < b->zIndex;
	});

	// draw layers one by one
	for (auto it = buffs.begin(); it != buffs.end(); ++it) {
		SpriteLayer* buff = (*it);

		if (buff->numSprites > 0) {
			glVertexPointer(3, GL_FLOAT, 0, &buff->verts[0]);
			glColorPointer(4, GL_UNSIGNED_BYTE, 0, &buff->colors[0]);
			glTexCoordPointer(2, GL_FLOAT, 0, &buff->coords[0]);

			buff->texture->bind();
			glDrawArrays(GL_TRIANGLES, 0, buff->numSprites * 6);
			buff->texture->unbind();
		}
	}

	glDisableClientState(GL_VERTEX_ARRAY);
	glDisableClientState(GL_COLOR_ARRAY);
	glDisableClientState(GL_TEXTURE_COORD_ARRAY);
}


void SpriteSheetRenderer::AddTexCoords(SpriteTile& tile) {

	int coordOffset = GetCoordOffset();

	float x1, y1, x2, y2;

	switch (tile.dir) {
	case NONE:
		// rounding errors elimination
		x1 = tile.offsetX + 0.5f;
		y1 = tile.offsetY + 0.5f;
		x2 = tile.offsetX + tile.width - 0.5f;
		y2 = tile.offsetY + tile.height - 0.5f;
		break;
	case HORIZONTALLY:
		x1 = tile.offsetX + tile.width;
		y1 = tile.offsetY;
		x2 = tile.offsetX;
		y2 = tile.offsetY + tile.height;
		break;
	case VERTICALLY:
		x1 = tile.offsetX;
		y1 = tile.offsetY + tile.height;
		x2 = tile.offsetX + tile.width;
		y2 = tile.offsetY;
		break;
	case HORIZ_VERT:
		x1 = tile.offsetX + tile.width;
		y1 = tile.offsetY + tile.height;
		x2 = tile.offsetX;
		y2 = tile.offsetY;
		break;
	default:
		break;
	}

	float* coords = actualBuffer->coords;

	coords[coordOffset] = coords[coordOffset + 4] = coords[coordOffset + 8] = x1*actualBuffer->textureCoeffX;
	coords[coordOffset + 1] = coords[coordOffset + 3] = coords[coordOffset + 7] = y1*actualBuffer->textureCoeffY;
	coords[coordOffset + 2] = coords[coordOffset + 6] = coords[coordOffset + 10] = x2*actualBuffer->textureCoeffX;
	coords[coordOffset + 5] = coords[coordOffset + 9] = coords[coordOffset + 11] = y2*actualBuffer->textureCoeffY;
}

void SpriteSheetRenderer::AddTexCoords(FlipDirection f, float posX, float posY, float w, float h) {
	int coordOffset = GetCoordOffset();

	// for OPENGL-ES, the coefficients will clamp the w and h to range <0-1> 
	w *= actualBuffer->textureCoeffX;
	h *= actualBuffer->textureCoeffY;

	switch (f) {
	case NONE:
		AddTexCoords(coordOffset, posX, posY, posX + w, posY + h);
		break;
	case HORIZONTALLY:
		AddTexCoords(coordOffset, posX + w, posY, posX, posY + h);
		break;
	case VERTICALLY:
		AddTexCoords(coordOffset, posX, posY + h, posX + w, posY);
		break;
	case HORIZ_VERT:
		AddTexCoords(coordOffset, posX + w, posY + h, posX, posY);
		break;
	default:
		break;
	}
}

void SpriteSheetRenderer::AddTexCoords(int offset, float x1, float y1, float x2, float y2) {

	float* coords = actualBuffer->coords;
	coords[offset] = coords[offset + 4] = coords[offset + 8] = x1;
	coords[offset + 1] = coords[offset + 3] = coords[offset + 7] = y1;
	coords[offset + 2] = coords[offset + 6] = coords[offset + 10] = x2;
	coords[offset + 5] = coords[offset + 9] = coords[offset + 11] = y2;
}

void SpriteSheetRenderer::SetTexCoeffs(int textureWidth, int textureHeight) {
	actualBuffer->textureCoeffX = actualBuffer->textureCoeffY = 1;

	// if there is no ARB, all textures must be power of 2
#ifdef TARGET_OPENGLES	
	actualBuffer->textureCoeffX = 1.0f / textureWidth;
	actualBuffer->textureCoeffY = 1.0f / textureHeight;
#endif
}

void SpriteSheetRenderer::MakeQuad(int offset, SpriteTile& tile) {

	float w = tile.width*tile.scaleX / 2.0f;
	float h = tile.height*tile.scaleY / 2.0f;
	float x = tile.posX;
	float y = tile.posY;
	float rot = tile.rotation;
	float* verts = actualBuffer->verts;

	verts[offset + 2] = verts[offset + 5] = verts[offset + 11] = verts[offset + 8] = verts[offset + 14] = verts[offset + 17] = tile.posZ;

	if (rot == 0) {
		// no rotation
		verts[offset] = x + -w;
		verts[offset + 1] = y + -h;
		verts[offset + 3] = verts[offset + 9] = x + w;
		verts[offset + 4] = verts[offset + 10] = y + -h;
		verts[offset + 6] = verts[offset + 12] = x + -w;
		verts[offset + 7] = verts[offset + 13] = y + h;
		verts[offset + 15] = x + w;
		verts[offset + 16] = y + h;
	}
	else {
		// calc with rotation
		verts[offset] = x + GetX(-w, -h, rot);
		verts[offset + 1] = y + GetY(-w, -h, rot);
		verts[offset + 3] = verts[offset + 9] = x + GetX(w, -h, rot);
		verts[offset + 4] = verts[offset + 10] = y + GetY(w, -h, rot);
		verts[offset + 6] = verts[offset + 12] = x + GetX(-w, h, rot);
		verts[offset + 7] = verts[offset + 13] = y + GetY(-w, h, rot);
		verts[offset + 15] = x + GetX(w, h, rot);
		verts[offset + 16] = y + GetY(w, h, rot);
	}
}

void SpriteSheetRenderer::MakeQuad(int offset, float x1, float y1, float z1,
	float x2, float y2, float z2, float x3, float y3, float z3, float x4, float y4, float z4) {

	float* verts = actualBuffer->verts;

	verts[offset] = x1;
	verts[offset + 1] = y1;
	verts[offset + 2] = z1;

	verts[offset + 3] = verts[offset + 9] = x2;
	verts[offset + 4] = verts[offset + 10] = y2;
	verts[offset + 5] = verts[offset + 11] = z2;

	verts[offset + 6] = verts[offset + 12] = x3;
	verts[offset + 7] = verts[offset + 13] = y3;
	verts[offset + 8] = verts[offset + 14] = z3;

	verts[offset + 15] = x4;
	verts[offset + 16] = y4;
	verts[offset + 17] = z4;
}

void SpriteSheetRenderer::MakeColorQuad(int offset, ofColor& col) {
	unsigned char* colors = actualBuffer->colors;

	colors[offset] = colors[offset + 4] = colors[offset + 8] = colors[offset + 12] = colors[offset + 16] = colors[offset + 20] = col.r;
	colors[offset + 1] = colors[offset + 5] = colors[offset + 9] = colors[offset + 13] = colors[offset + 17] = colors[offset + 21] = col.g;
	colors[offset + 2] = colors[offset + 6] = colors[offset + 10] = colors[offset + 14] = colors[offset + 18] = colors[offset + 22] = col.b;
	colors[offset + 3] = colors[offset + 7] = colors[offset + 11] = colors[offset + 15] = colors[offset + 19] = colors[offset + 23] = col.a;
}
