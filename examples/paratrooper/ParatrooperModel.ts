export class ParatrooperModel {
    // dynamic data
    score = 0;
    landedUnits = 0;
    coptersCreated = 0;
    isGameOver = false;

    // static data
    maxLandedUnits = 10;
    minCannonAngle = -45;
    maxCannonAngle = 45;
    cannonFireRate = 6;
    paratrooperSpawnFrequency = 0.4;
    copterSpawnFrequency = 0.2;
    copterReward = 10;
    paratrooperFallingReward = 2;
    paratrooperShotReward = 1;
    shootPenalty = 1;
    projectileVelocity = 0.5;
    gravity = 0.0005;
    parachuteDecceleration = 0.013;

    // positions for copter spawning (in relative units)
    copterSpawnMinY = 0.1;
    copterSpawnMaxY = 0.2;

    copterMinVelocity = 0.1;
    copterMaxVelocity = 0.15;

    // the altitude where the paratrooper should open his parachute
    parachuteOpenAltitude = 20;
    // min velocity where the decceleration upon parachute opening should take place
    parachuteOpenVelocityThreshold = 0.05;

    /**
     * Resets dynamic data
     */
    reset() {
        this.score = 0;
        this.landedUnits = 0;
        this.coptersCreated = 0;
        this.isGameOver = false;
    }
}