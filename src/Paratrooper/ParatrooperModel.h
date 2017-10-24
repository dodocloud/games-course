#pragma once

/**
 * Game model with static and dynamic attributes
 * Loaded from config.json
 */
class ParatrooperModel {
public:
	// dynamic data
	int score = 0;
	int landedUnits = 0;
	int coptersCreated = 0;
	bool isGameOver = false;

	// static data
	int maxLandedUnits;
	float minCannonAngle;
	float maxCannonAngle;
	float cannonFireRate;
	float paratrooperSpawnFrequency;
	float copterSpawnFrequency;
	int copterReward;
	int paratrooperFallingReward;
	int paratrooperShotReward;
	int shootPenalty;
	float projectileVelocity;
	float gravity;
	float parachuteDecceleration;

	// positions for copter spawning (in relative units)
	float copterSpawnMinY;
	float copterSpawnMaxY;

	float copterMinVelocity;
	float copterMaxVelocity;

	// the altitude where the paratrooper should open his parachute
	float parachuteOpenAltitude;
	// min velocity where the decceleration upon parachute opening should take place
	float parachuteOpenVelocityThreshold;

	/**
	 * Resets dynamic data
	 */
	void Reset() {
		score = 0;
		landedUnits = 0;
		coptersCreated = 0;
		isGameOver = false;
	}
};