#pragma once

#include "ofMain.h"

// perlin noise generator
class PerlinNoise {
private:
	int seed;
public:

	PerlinNoise(int seed) : seed(seed) {}


	// calculates perlin noise at specified coordinates, returns value between -1 and 1
	float PerlinNoise2D(int x, int y, float persistence, int octaves, float zoom) {
		// total output noise value
		float total = 0.0f;
		// initial frequency
		float frequency = zoom;
		// initial amplitude
		float amplitude = 1.0f;

		// for each octave
		for (int i = 0; i < octaves; i++) {
			// calculate noise
			total = total + InterpolatedNoise(x * frequency, y * frequency) * amplitude;
			// set frequency and amplitude
			frequency = frequency * 2;
			// decrease amplitude
			amplitude = amplitude * persistence;

		}

		// fix bound values
		if (total < -1) total = -1;
		if (total > 1) total = 1;
		return total;
	}

	void PerlinNoise2DPlane(unsigned char* data, int width, int height, float persistence, int octaves, float zoom) {
		// for each pixel, generate its perlin value and write it into RGB channel
		for (int i = 0; i<width; i++) {
			for (int j = 0; j<height; j++) {
				float val = this->PerlinNoise2D(i, j, persistence, octaves, zoom);
				float colorVal = (val + 1) * 127;

				data[(i + j*width) * 3 + 2] = (unsigned char)(colorVal);
				data[(i + j*width) * 3 + 1] = (unsigned char)(colorVal);
				data[(i + j*width) * 3 + 0] = (unsigned char)(colorVal);
			}
		}
	}

private:
	// gets interpolated noise for various levels of zooming
	float InterpolatedNoise(float x, float y) {
		float i1, i2;
		// interpolate according to X for bottom part, parameter is fraction part of x
		i1 = CosineInterpolation(SmoothNoise((int)x, (int)y), SmoothNoise((int)(x + 1), (int)(y)), x - ((int)(x)));
		// interpolate according to X for upper part
		i2 = CosineInterpolation(SmoothNoise((int)x, (int)(y + 1)), SmoothNoise((int)(x + 1), (int)(y + 1)), x - ((int)(x)));
		// interpolate according to Y, parameter is fraction part of y
		return CosineInterpolation(i1, i2, y - (int)y);
	}

	// linear coherent-noise function
	float Noise(int x, int y) {
		int n = x + y*seed;
		// spread information contained in input value across all bits
		n ^= (n << 13);
		// spread information across all domains, using three magnitudes
		n = (n * (n * n * (15731) + (789221)) + (1376312589));
		// scale it down to the interval 0..2 and correct to -1..1
		float output = (float)(1.0 - (n & 0x7fffffff) / 1073741824.0);
		return output;
	}

	float SmoothNoise(int x, int y) {
		/*
		*  |x-1,y+1| x ,y+1|x+1,y+1|
		*  |x-1,y  | x ,y  |x+1,y  |
		*  |x-1,y-1| x ,y-1|x+1,y-1|
		*/

		// smooth corners (left upper, left down etc.)
		float corners = (Noise(x - 1, y - 1) + Noise(x + 1, y - 1) + Noise(x - 1, y + 1) + Noise(x + 1, y + 1)) / 16;
		// smooth sides (left, right,...)
		float sides = (Noise(x - 1, y) + Noise(x + 1, y) + Noise(x, y - 1) + Noise(x, y + 1)) / 8;
		// smooth center
		float center = Noise(x, y) / 4;
		// sum values
		return corners + sides + center;
	}

	// cosine interpolation
	// v1: first value to interpolate between
	// v2: second value to interpolate between
	// x: interpolating parameter
	float CosineInterpolation(float v1, float v2, float x) {
		float f = (float)(1 - cos(x * 3.1415927)) * 0.5f;
		return v1 * (1 - f) + v2 * f;
	}
};


class PerlinNoiseExample : public ofBaseApp {
public:
	ofImage image;

	void setup() {
		int width = ofGetWindowWidth();
		int height = ofGetWindowHeight();
		float persistence = .8f;
		int octaves = 20;
		float zoom = .43f;
		int seed = 50025;

	
		// allocate bitmap array
		unsigned char* data = (unsigned char *)malloc(3 * width*height);

		// reset bites in data array
		memset(data, 0, sizeof(data));
		// init perlin generator
		PerlinNoise noise(seed);
		// calculate perlin noise
		noise.PerlinNoise2DPlane(data, width, height, persistence, octaves, zoom);
		image.setFromPixels(data, width, height, ofImageType::OF_IMAGE_COLOR, true);
	}


	void update() {
		
	}

	void draw() {
		image.draw(0, 0);
	}

};
