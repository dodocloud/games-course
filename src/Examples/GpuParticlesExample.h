#pragma once

#include "ofMain.h"


#define _PROGRAMMABLE_RENDERER


/**
 * For now, only uses RGBA and TEXTURE_RECTANGLE to make usage simpler
 */
class GpuParticles {
public:
	static const string UNIFORM_PREFIX;
	static const string UPDATE_SHADER_NAME;
	static const string DRAW_SHADER_NAME;
	static const unsigned FLOATS_PER_TEXEL = 4;

	// you don't have to use these but makes
	// code more readable
	enum DataTextureIndex {
		POSITION,
		VELOCITY
	};

	GpuParticles();

	void init(unsigned width, unsigned height, ofPrimitiveMode primitive = OF_PRIMITIVE_POINTS, bool loadDefaultShaders = false, unsigned numDataTextures = 2);
	void update();
	void draw();

	void loadShaders(const string& updateShaderName, const string& drawShaderName);

	void loadDataTexture(unsigned idx, float* data,
		unsigned x = 0, unsigned y = 0, unsigned width = 0, unsigned height = 0);
	
	// fills data structure with zeroes
	void zeroDataTexture(unsigned idx,
		unsigned x = 0, unsigned y = 0, unsigned width = 0, unsigned height = 0);

	unsigned getWidth() const { return width; }
	unsigned getHeight() const { return height; }
	unsigned getNumFloats() const { return numFloats; }

	void setTextureLocation(unsigned textureLocation) { this->textureLocation = textureLocation; }

	// listen to these events to set custom uniforms
	ofEvent<ofShader> updateEvent;
	ofEvent<ofShader> drawEvent;

	// gets reference to the vbo mesh
	ofVboMesh& getMeshRef() { return mesh; }

	// advanced
	ofShader& getUpdateShaderRef() { return updateShader; }
	ofShader& getDrawShaderRef() { return drawShader; }

private:
	void setUniforms(ofShader& shader);

	ofFbo fbos[2];
	ofVboMesh mesh;
	ofVboMesh quadMesh;
	ofShader updateShader, drawShader;
	unsigned currentReadFbo;
	unsigned textureLocation;
	unsigned width, height, numFloats;
};


class GpuParticlesExample : public ofBaseApp {
public:
	void setup();
	void update();
	void draw();

private:
	// set any update uniforms in this function
	void onParticlesUpdate(ofShader& shader);

	GpuParticles particles;
	ofEasyCam cam;
};
