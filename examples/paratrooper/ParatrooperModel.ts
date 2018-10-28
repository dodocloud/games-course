export class ParatrooperModel {
    // dynamic data
    score = 0;
    landedUnits = 0;
    coptersCreated = 0;
    isGameOver = false;

    // static data
    maxLandedUnits = 0;
    minCannonAngle = 0;
    maxCannonAngle = 0;
    cannonFireRate = 0;
    paratrooperSpawnFrequency = 0;
    copterSpawnFrequency = 0;
    copterReward = 0;
    paratrooperFallingReward = 0;
    paratrooperShotReward = 0;
    shootPenalty = 0;
    projectileVelocity = 0;
    gravity = 0;
    parachuteDecceleration = 0;

    // positions for copter spawning (in relative units)
    copterSpawnMinY = 0;
    copterSpawnMaxY = 0;

    copterMinVelocity = 0;
    copterMaxVelocity = 0;

    // the altitude where the paratrooper should open his parachute
    parachuteOpenAltitude = 0;
    // min velocity where the decceleration upon parachute opening should take place
    parachuteOpenVelocityThreshold = 0;

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