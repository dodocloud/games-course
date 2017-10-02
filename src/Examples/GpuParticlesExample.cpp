#include "GpuParticlesExample.h"
#include "AphUtils.h"


const string GpuParticles::UNIFORM_PREFIX = "particles";
const string GpuParticles::UPDATE_SHADER_NAME = "update";
const string GpuParticles::DRAW_SHADER_NAME = "draw";

GpuParticles::GpuParticles() : currentReadFbo(0), textureLocation(0) {
}

void GpuParticles::init(unsigned width, unsigned height, ofPrimitiveMode primitive, 
	bool loadDefaultShaders, unsigned numDataTextures) {
	
	this->width = width;
	this->height = height;
	
	numFloats = width * height * FLOATS_PER_TEXEL;

	// fbos
	ofFbo::Settings s;
	s.internalformat = GL_RGBA32F_ARB;
	s.textureTarget = GL_TEXTURE_RECTANGLE_ARB;
	s.minFilter = GL_NEAREST;
	s.maxFilter = GL_NEAREST;
	s.wrapModeHorizontal = GL_CLAMP;
	s.wrapModeVertical = GL_CLAMP;
	s.width = width;
	s.height = height;
	s.numColorbuffers = numDataTextures;
	
	// allocate two fbos for ping-pong mechanism
	for (unsigned i = 0; i < 2; ++i) {
		fbos[i].allocate(s);
	}

	// create vertex for each particle
	mesh.clear();
	for (int y = 0; y < height; ++y) {
		for (int x = 0; x < width; ++x) {
			mesh.addVertex(ofVec3f(200.f * x / (float)width - 100.f, 200.f * y / (float)height - 100.f, -500.f));
			mesh.addTexCoord(ofVec2f(x, y));
		}
	}
	mesh.setMode(primitive);

	// create 2D plane that will have all particles inside
	quadMesh.addVertex(ofVec3f(-1.f, -1.f, 0.f));
	quadMesh.addVertex(ofVec3f(1.f, -1.f, 0.f));
	quadMesh.addVertex(ofVec3f(1.f, 1.f, 0.f));
	quadMesh.addVertex(ofVec3f(-1.f, 1.f, 0.f));

	quadMesh.addTexCoord(ofVec2f(0.f, 0.f));
	quadMesh.addTexCoord(ofVec2f(width, 0.f));
	quadMesh.addTexCoord(ofVec2f(width, height));
	quadMesh.addTexCoord(ofVec2f(0.f, height));

	quadMesh.addIndex(0);
	quadMesh.addIndex(1);
	quadMesh.addIndex(2);
	quadMesh.addIndex(0);
	quadMesh.addIndex(2);
	quadMesh.addIndex(3);

	quadMesh.setMode(OF_PRIMITIVE_TRIANGLES);

	// shaders
	if (loadDefaultShaders) {
		updateShader.load(UPDATE_SHADER_NAME);
		drawShader.load(DRAW_SHADER_NAME);
	}
}

void GpuParticles::loadShaders(const string& updateShaderName, const string& drawShaderName) {
	updateShader.load(updateShaderName);
	drawShader.load(drawShaderName);
}

void GpuParticles::update() {

	fbos[1 - currentReadFbo].begin(false);
	glPushAttrib(GL_ENABLE_BIT);
	
	// we set up no camera model and ignore the modelview and projection matrices
	// in the vertex shader, we make a viewport large enough to ensure the shader
	// is executed for each pixel
	
	// btw this is important. Shader has to be executed for each pixel, otherwise the computation would
	// affect only part of the box
	glViewport(0, 0, width, height);
	glDisable(GL_BLEND);
	ofSetColor(255, 255, 255);
	fbos[1 - currentReadFbo].activateAllDrawBuffers();

	updateShader.begin();
	// notify event that we have updated the shader
	ofNotifyEvent(updateEvent, updateShader, this);
	setUniforms(updateShader);
	quadMesh.draw();
	updateShader.end();
	glPopAttrib();
	fbos[1 - currentReadFbo].end();

	// switch FBO using the ping-pong mechanism
	currentReadFbo = 1 - currentReadFbo;
}

void GpuParticles::draw() {
	drawShader.begin();
	ofNotifyEvent(drawEvent, drawShader, this);
	setUniforms(drawShader);
	mesh.draw();
	drawShader.end();
}

void GpuParticles::setUniforms(ofShader& shader) {
	for (unsigned i = 0; i < fbos[currentReadFbo].getNumTextures(); ++i) {
		ostringstream oss;
		oss << UNIFORM_PREFIX << ofToString(i);
		shader.setUniformTexture(oss.str().c_str(), fbos[currentReadFbo].getTexture(i), i + textureLocation);
	}
}

void GpuParticles::loadDataTexture(unsigned idx, float* data,
	unsigned x, unsigned y, unsigned width, unsigned height) {
	if (idx < fbos[currentReadFbo].getNumTextures()) {
		if (!width) width = this->width;
		if (!height) height = this->height;
		fbos[currentReadFbo].getTexture(idx).bind();
		glTexSubImage2D(GL_TEXTURE_RECTANGLE_ARB, 0, x, y, width, height, GL_RGBA, GL_FLOAT, data);
		fbos[currentReadFbo].getTexture(idx).unbind();
	}
	else ofLogError() << "Trying to load data from array into non-existent buffer.";
}

void GpuParticles::zeroDataTexture(unsigned idx,
	unsigned x, unsigned y, unsigned width, unsigned height) {
	if (!width) width = this->width;
	if (!height) height = this->height;
	float* zeroes = new float[width * height * FLOATS_PER_TEXEL];
	memset(zeroes, 0, sizeof(float) * width * height * FLOATS_PER_TEXEL);
	loadDataTexture(idx, zeroes, x, y, width, height);
	delete[] zeroes;
}



//--------------------------------------------------------------
void GpuParticlesExample::setup() {
	if (CheckAPHVersion()) {
		ofBackground(0);
		ofSetFrameRate(60);

		// 1,000,000 particles
		unsigned w = 1000;
		unsigned h = 1000;

		particles.init(w, h);

		// try to load 330, if the device supports it
		if (ofIsGLProgrammableRenderer()) particles.loadShaders("Examples/shaders330/update", "Examples/shaders330/draw");
		else particles.loadShaders("Examples/shaders120/update", "Examples/shaders120/draw");

		// initial positions
		// use new to allocate 4,000,000 floats on the heap rather than the stack
		float* particlePosns = new float[w * h * 4];
		for (unsigned y = 0; y < h; ++y) {
			for (unsigned x = 0; x < w; ++x) {
				unsigned idx = y * w + x;
				particlePosns[idx * 4] = 400.f * x / (float)w - 200.f; // particle x
				particlePosns[idx * 4 + 1] = 400.f * y / (float)h - 200.f; // particle y
				particlePosns[idx * 4 + 2] = 0.f; // particle z
				particlePosns[idx * 4 + 3] = 0.f; // dummy
			}
		}

		// two textures -> positions and velocities

		particles.loadDataTexture(GpuParticles::POSITION, particlePosns);
		delete[] particlePosns;

		// initial velocities
		particles.zeroDataTexture(GpuParticles::VELOCITY);

		// listen for update event to set additonal update uniforms
		ofAddListener(particles.updateEvent, this, &GpuParticlesExample::onParticlesUpdate);
	}
}

//--------------------------------------------------------------
void GpuParticlesExample::update() {
	ofSetWindowTitle(ofToString(ofGetFrameRate(), 2));
	particles.update();
}

// set any update uniforms in this function
void GpuParticlesExample::onParticlesUpdate(ofShader& shader) {
	ofVec3f mouse(ofGetMouseX() - .5f * ofGetWidth(), .5f * ofGetHeight() - ofGetMouseY(), 0.f);
	shader.setUniform3fv("mouse", mouse.getPtr());
	shader.setUniform1f("elapsed", ofGetLastFrameTime());
	shader.setUniform1f("radiusSquared", 200.f * 200.f);
}

//--------------------------------------------------------------
void GpuParticlesExample::draw() {
	cam.begin();
	ofEnableBlendMode(OF_BLENDMODE_ADD);
	particles.draw();
	ofDisableBlendMode();
	cam.end();
}
