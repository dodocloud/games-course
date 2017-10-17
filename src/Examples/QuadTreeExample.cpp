#include "QuadtreeExample.h"

#define WIDTH 800
#define HEIGHT 600

struct QuadTreeItem {
	float x;
	float y;
	int width;
	int height;
	float vx;
	float vy;
};

struct QTBounds {
	float x;
	float y;
	int width;
	int height;
};


template<typename T>
class Quadtree {
public:
	QTBounds bounds;
	int max_objects;
	int max_levels;
	int level;

	// children
	Quadtree* topRight = nullptr;
	Quadtree* topLeft = nullptr;
	Quadtree* bottomLeft = nullptr;
	Quadtree* bottomRight = nullptr;

	vector<T> objects;

	Quadtree(QTBounds& bounds, int max_objects = 1, int max_levels = 8, int level = 0) {
		this->bounds = bounds;
		this->max_objects = max_objects;
		this->max_levels = max_levels;
		this->level = level;
	}


	void split() {
		auto nextLevel = this->level + 1;
		int subWidth = round(bounds.width / 2);
		int subHeight = round(bounds.height / 2);
		float x = round(bounds.x);
		float y = round(bounds.y);

		auto topRight = QTBounds{ x + subWidth, y, subWidth, subHeight };
		auto topLeft = QTBounds{ x, y, subWidth, subHeight };
		auto bottomLeft = QTBounds{ x, y + subHeight, subWidth, subHeight };
		auto bottomRight = QTBounds{ x + subWidth, y + subHeight, subWidth, subHeight };

		// top-right
		this->topRight = (new Quadtree(topRight, max_objects, max_levels, nextLevel));
		// top-left
		this->topLeft = (new Quadtree(topLeft, max_objects, max_levels, nextLevel));
		// bottom-left
		this->bottomLeft = (new Quadtree(bottomLeft, max_objects, max_levels, nextLevel));
		// bottom-right
		this->bottomRight = (new Quadtree(bottomRight, max_objects, max_levels, nextLevel));
	}

	int getIndex(T& rect) {
		int index = -1;
		int verticalMidpoint = bounds.x + (bounds.width / 2);
		int horizontalMidpoint = bounds.y + (bounds.height / 2);
		bool topQuadrant = rect.y < horizontalMidpoint && (rect.y + rect.height) < horizontalMidpoint;
		bool bottomQuadrant = rect.y > horizontalMidpoint;

		if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
			if (topQuadrant) {
				index = 1;
			}
			else if (bottomQuadrant) {
				index = 2;
			}
		}
		else if (rect.x > verticalMidpoint) {
			if (topQuadrant) {
				index = 0;
			}
			else if (bottomQuadrant) {
				index = 3;
			}
		}

		return index;
	}

	void insert(T& rect) {
		int i = 0;
		int index;

		// if we have subnodes
		if (topRight != nullptr) {
			index = getIndex(rect);
			if (index != -1) {
				switch (index) {
				case 0: topRight->insert(rect);
					break;
				case 1: topLeft->insert(rect);
					break;
				case 2: bottomLeft->insert(rect);
					break;
				case 3: bottomRight->insert(rect);
					break;
				}

				return;
			}
		}

		objects.push_back(rect);

		if (objects.size() > max_objects && level < max_levels) {
			// split if we don't already have subnodes
			if (topRight == nullptr) {
				this->split();
			}

			// add all objects to corresponding nodes
			while (i < objects.size()) {
				auto& obj = this->objects[i];
				index = this->getIndex(obj);
				objects.erase(objects.begin() + i);

				if (index != -1) {
					switch (index) {
					case 0: topRight->insert(obj);
						break;
					case 1: topLeft->insert(obj);
						break;
					case 2: bottomLeft->insert(obj);
						break;
					case 3: bottomRight->insert(obj);
						break;
					}
				}
				else {
					i++;
				}
			}
		}
	}

	void clear() {
		objects.clear();

		if (topRight != nullptr) {
			topRight->clear();
			topLeft->clear();
			bottomLeft->clear();
			bottomRight->clear();
		}

		topRight = topLeft = bottomLeft = bottomRight = nullptr;
	}

};

Quadtree<QuadTreeItem>* tree;
vector<QuadTreeItem> items;

void QuadTreeExample::setup() {
	ofBackground(0, 0, 0);
	QTBounds it{ 0, 0, WIDTH, HEIGHT };

	tree = new Quadtree<QuadTreeItem>(it);

	for (int i = 0; i < 1000; i++) {
		QuadTreeItem it{ (float)ofRandom(0,WIDTH), (float)ofRandom(0,HEIGHT), 3, 3, ofRandom(-2.5f, 2.5f), ofRandom(-2.5f, 2.5f) };
		items.push_back(it);
	}
}

void QuadTreeExample::update() {
	// remove all objects and subnodes
	tree->clear();

	// update my objects and insert theim into the tree again
	for (auto i = 0; i<items.size(); i++) {
		items[i].x += items[i].vx * (WIDTH / 2 - items[i].x)*0.004f;
		items[i].y += items[i].vy* (HEIGHT / 2 - items[i].y)*0.004f;

		if ((items[i].x + items[i].width) > WIDTH)  items[i].vx = -items[i].vx;
		if (items[i].x < 0) items[i].vx = -items[i].vx;
		if ((items[i].y + items[i].height) > HEIGHT) items[i].vy = -items[i].vy;
		if (items[i].y < 0)items[i].vy = -items[i].vy;

		tree->insert(items[i]);
	}
}

void drawQuadtree(Quadtree<QuadTreeItem>* node) {
	auto bounds = node->bounds;

	// no subnodes? Draw the current node
	if (node->topRight == nullptr) {
		ofRect(bounds.x, bounds.y, bounds.width, bounds.height);
	}
	else {
		drawQuadtree(node->topRight);
		drawQuadtree(node->topLeft);
		drawQuadtree(node->bottomLeft);
		drawQuadtree(node->bottomRight);
	}
}

void QuadTreeExample::draw() {
	ofSetColor(255, 255, 0);
	ofSetLineWidth(1);
	ofNoFill();


	for (auto& obj : items) {
		ofRect(obj.x, obj.y, obj.width, obj.height);
	}

	ofSetColor(255, 0, 0);
	ofSetLineWidth(2);
	drawQuadtree(tree);
}