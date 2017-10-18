#pragma once

#include "ofBufferObject.h"
#include "States.h"
#include "Map.h"

/**
 * Loader for pacman map
 */
class MapLoader {
public:
#define PARSER_MODE_PATHS 1
#define PARSER_MODE_FUNCTIONS 2

	/**
	 * Loads a map from a file into output entity
	 */
	void LoadMap(string filename, Map& output) {

		map<int, MapTile> blocks;

		ofBuffer buffer = ofBufferFromFile(filename);

		int width = 0;
		int height = 0;
		int index = 0;

		// parse paths then functions
		int currentMode = PARSER_MODE_PATHS;
		
		if (buffer.size()) {

			int i = 0;
			// parse lines
			for (ofBuffer::Line it = buffer.getLines().begin(), end = buffer.getLines().end(); it != end; ++it) {
				string line = *it;
				size_t pos = 0;
				string codeStr;

				int j = 0;

				if(line.find("//") != -1) {
					// skip comments
					continue;
				}

				if (line == "" && currentMode != PARSER_MODE_FUNCTIONS) {
					// switch to function parser
					currentMode = PARSER_MODE_FUNCTIONS;
					i = j = index = 0;
					continue;
				}

				// parse identifiers
				while ((pos = ((currentMode == PARSER_MODE_FUNCTIONS) ? line.find(" ") : line.find("\t"))) != string::npos) {
					codeStr = line.substr(0, pos);

					int code = ofToInt(codeStr);

					switch(currentMode) {
					case PARSER_MODE_FUNCTIONS:
						// parse special function for each cell
						blocks[index++].specialFunction = code;
						break;
					case PARSER_MODE_PATHS:
						// parse available paths for each cell
						auto tile = MapTile();
						tile.x = j;
						tile.y = i;
						tile.code = code;
						blocks[index++] = tile;
						break;
					}


					line.erase(0, pos + 1);

					j++;
					if (j > width) width = j;
				}

				i++;
				if (i > height) height = i;
			}
		}

		output.blocks = blocks;
		output.gridWidth = width;
		output.gridHeight = height;
	}
};