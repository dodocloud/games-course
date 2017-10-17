#pragma once


/**
* Structure that provides information
* about movement possibilities of certain unit
*/
struct MovementInfo {
	int intPartX;		// integer part of position X
	int intPartY;		// integer part of position Y
	float fractPartX;	// fractional part of position X
	float fractPartY;	// fractional part of position Y
	bool canGoDown;		// whether the unit can go down
	bool canGoLeft;		// whether the unit can go to the left
	bool canGoRight;	// whether the unit can go to the right
	bool canGoUp;		// whether the unit can go up
	bool isInCenter;	// whether the unit is in the center of a block
	bool isAroundCenter;// whether the unit is near the center of a block
};
