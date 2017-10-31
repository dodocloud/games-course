#include "VerletExample.h"


// ---------------------- Pin constraint ----------------------

void PinConstraint::relax(float stepCoef) {
	// update position of the particle
	a->pos.set(pos);
}
void PinConstraint::draw() const {
	ofFill();
	ofSetColor(0, 153, 255, 25);
	ofDrawCircle(pos, 6);
}

// ---------------------- Distance constraint ----------------------

void DistanceConstraint::relax(float stepCoef) {
	ofVec2f normal = a->pos - b->pos;
	float m = normal.lengthSquared();
	normal *= ((distance*distance - m) / m)*stiffness*stepCoef;
	// update both particles
	a->pos += normal;
	b->pos -= normal;
}


// update function
void Verlet::frame(float step) {
	// for each particle of all composites
	for (auto & composite : composites) {
		for (auto & particle : composite.particles) {
			// calculate velocity
			ofVec2f velocity = (particle.pos - particle.lastPos) * friction;
			// save last good state
			particle.lastPos = particle.pos;
			// gravity
			particle.pos += gravity;
			// inertia
			particle.pos += velocity;
		}
	}

	// handle dragging of entities
	if (draggedEntity) {
		*draggedEntity = mouse;
	}

	// The all magic is done here!
	// When the position is shifted by velocity, we need to iterate through all the constraints
	// and call the Relax function that will relax the element along given degree of freedom
	float stepCoeff = 1 / step;
	for (auto & composite : composites) {
		for (int i = 0; i < step; i++) {
			for (auto & constraint : composite.constraints) {
				// if you remove this line, all particles drop down along the gravity vector
				constraint->relax(stepCoeff);
			}
		}
	}

	// update meshes
	particlesVbo.updateVertexData(&composites[0].particles[0].pos.x, composites[0].particles.size());
}


Cloth::Cloth(const ofVec2f & origin, float width, float height, int segments, int pinMod, float stiffness)
	:Verlet(width, height) {

	// compose the whole object
	composites.resize(1);
	auto & composite = composites.back();
	composite.particles.reserve(segments * segments);


	int xStride = width / segments;
	int yStride = height / segments;

	for (int y = 0; y < segments; y++) {
		for (int x = 0; x < segments; x++) {
			// calculate absolute coords in pixels
			float px = origin.x + x*xStride - width / 2 + xStride / 2;
			float py = origin.y + y*yStride - height / 2 + yStride / 2;
			
			// add particle
			composite.particles.push_back(VerletParticle(ofVec2f(px, py)));

			if (x > 0) {
				// add distance constraint with the previous particle
				auto a = &composite.particles[y*segments + x];
				auto b = &composite.particles[y*segments + (x - 1)];
				composite.constraints.push_back(new DistanceConstraint(a, b, stiffness));
			}

			if (y > 0) {
				// add distance constraint with the upper particle
				auto a = &composite.particles[y*segments + x];
				auto b = &composite.particles[(y - 1)*segments + x];
				composite.constraints.push_back(new DistanceConstraint(a, b, stiffness));
			}
		}
	}

	// add pins
	for (int x = 0; x < segments; x++) {
		if (x % pinMod == 0) {
			composite.pin(x);
		}
	}

	particlesVbo.setVertexData(&composites[0].particles[0].pos.x, 2, composites[0].particles.size(), GL_STREAM_DRAW, sizeof(VerletParticle));
}

// ---------------------- Drawing functions ----------------------

void DistanceConstraint::draw() const {
	ofFill();
	ofSetHexColor(0xd8dde2);
	ofDrawLine(a->pos, b->pos);
}

void Verlet::draw() {
	for (auto & composite : composites) {
		for (auto & constraint : composite.constraints) {
			constraint->draw();
		}

		for (auto & particle : composite.particles) {
			particle.draw();
		}
	}

	// highlight nearest / dragged entity
	auto nearest = nearestEntity();
	if (nearest) {
		ofNoFill();
		ofSetHexColor(0x4f545c);
		ofDrawCircle(*nearest, 8);
	}
}

// ---------------------- Mouse control functions ----------------------

// looks for nearest entity when the mouse pointer is nearby
ofVec2f * Verlet::nearestEntity() {
	mouse = ofVec2f(ofGetMouseX(), ofGetMouseY());
	ofVec2f * entity = NULL;
	vector<Constraint*> * constraintsNearest = NULL;
	float selectionRadius = 10;
	float d2Nearest = numeric_limits<float>::max();
	for (auto & composite : composites) {
		for (auto & particle : composite.particles) {
			float d2 = particle.pos.squareDistance(mouse);
			if (d2 < selectionRadius*selectionRadius &&
				(!entity || d2 < d2Nearest)) {
				entity = &particle.pos;
				constraintsNearest = &composite.constraints;
				d2Nearest = d2;
			}
		}
	}

	if (constraintsNearest) {
		for (auto & constraint : *constraintsNearest) {
			PinConstraint * pin = dynamic_cast<PinConstraint*>(constraint);
			if (pin && &pin->a->pos == entity) {
				return &pin->pos;
			}
		}
	}

	return entity;
}

void Verlet::mousePressed(int x, int y) {
	auto nearest = nearestEntity();
	if (nearest) {
		draggedEntity = nearest;
	}
}

void Verlet::mouseMoved(int x, int y) {
	mouse.x = x;
	mouse.y = y;
}

void Verlet::mouseReleased() {
	draggedEntity = NULL;
}


