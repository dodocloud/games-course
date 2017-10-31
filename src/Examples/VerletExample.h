#include "ofMain.h"


class VerletParticle {
public:
	ofVec2f pos, lastPos;
	VerletParticle(const ofVec2f & pos)
		:pos(pos)
		, lastPos(pos) {
	}
	void draw() {
		ofFill();
		ofSetHexColor(0x2dad8f);
		ofDrawCircle(pos, 2);
	}
};

class Constraint {
public:
	virtual ~Constraint() {}
	virtual void relax(float stepCoef) = 0;
	virtual void draw() const = 0;
};

class PinConstraint : public Constraint {
public:
	VerletParticle * a;
	ofVec2f pos;
	PinConstraint(VerletParticle * a, const ofVec2f& pos)
		:a(a)
		, pos(pos) {
	}
	void relax(float stepCoef);

	void draw() const;
};

class DistanceConstraint : public Constraint {
public:
	VerletParticle *a, *b;
	float stiffness, distance;
	DistanceConstraint(VerletParticle * a, VerletParticle * b, float stiffness)
		:a(a)
		, b(b)
		, stiffness(stiffness) {
		distance = a->pos.distance(b->pos);
	}
	DistanceConstraint(VerletParticle * a, VerletParticle * b, float stiffness, float distance)
		:a(a)
		, b(b)
		, stiffness(stiffness)
		, distance(distance) {
	}
	void relax(float stepCoef);
	void draw() const;
};


class Composite {
public:
	vector<VerletParticle> particles;
	vector<Constraint*> constraints;

	PinConstraint & pin(int index, const ofVec2f& pos) {
		constraints.push_back(new PinConstraint(&particles[index], pos));
		return static_cast<PinConstraint&>(*constraints.back());
	}
	PinConstraint & pin(int index) {
		return pin(index, particles[index].pos);
	}
};

class Verlet {
public:
	float width, height;
	float friction;
	ofVec2f gravity;
	ofVec2f mouse;

	ofVec2f * draggedEntity;
	vector<Composite> composites;
	ofVbo particlesVbo;
	ofVbo constraintsVbo;

	Verlet(float width, float height)
		:width(width)
		, height(height)
		, friction(0.99)
		, gravity(0, 0.2)
		, draggedEntity(NULL) {
	}

	void frame(float step);

	void draw();

	ofVec2f * nearestEntity();

	void mousePressed(int x, int y);

	void mouseMoved(int x, int y);

	void mouseReleased();
};

class Cloth : public Verlet {
public:
	Cloth(const ofVec2f & origin, float width, float height, int segments, int pinMod, float stiffness);
};

class VerletExample : public ofBaseApp {
public:
	Cloth cloth;
	uint64_t t;

	VerletExample()
		:cloth(ofVec2f(ofGetWidth() / 2, ofGetHeight() / 2),
			ofGetWidth() / 2, ofGetHeight() / 2,
			25, 6, 2)
		, t(0) {

	}

	void setup() {
		ofBackground(255);
	}
	void update() {
		cloth.frame(16);
	}
	void draw() {
		cloth.draw();
	}
	void mousePressed(int x, int y, int button) {
		cloth.mousePressed(x, y);
	}
	void mouseDragged(int x, int y, int button) {
		cloth.mouseMoved(x, y);
	}
	void mouseReleased(int x, int y, int button) {
		cloth.mouseReleased();
	}
};