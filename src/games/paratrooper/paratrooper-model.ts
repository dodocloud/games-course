export class ParatrooperModel {
  // ========================= dynamic data
  score = 0;
  landedUnits = 0;
  coptersCreated = 0;
  isGameOver = false;
  // =========================


  // ========================= static data
  maxLandedUnits;
  minCannonAngle;
  maxCannonAngle;
  cannonFireRate;
  paratrooperSpawnFrequency;
  copterSpawnFrequency;
  copterReward;
  paratrooperFallingReward;
  paratrooperShotReward;
  shootPenalty;
  projectileVelocity;
  gravity;
  parachuteDecceleration;

  // positions for copter spawning (in relative units)
  copterSpawnMinY;
  copterSpawnMaxY;

  copterMinVelocity;
  copterMaxVelocity;

  // the altitude where the paratrooper should open his parachute
  parachuteOpenAltitude;
  // min velocity where the decceleration upon parachute opening should take place
  parachuteOpenVelocityThreshold;

  /**
   * Loads model from JSON structure
   */
  loadModel(data: any) {
    this.maxLandedUnits = data.max_landed_units;
    this.minCannonAngle = data.min_cannon_angle;
    this.maxCannonAngle = data.max_cannon_angle;
    this.cannonFireRate = data.cannon_fire_rate;
    this.paratrooperSpawnFrequency = data.paratrooper_spawn_frequency;
    this.copterSpawnFrequency = data.copter_spawn_frequency;
    this.copterReward = data.copter_reward;
    this.paratrooperFallingReward = data.paratrooper_falling_reward;
    this.paratrooperShotReward = data.paratrooper_shot_reward;
    this.shootPenalty = data.shoot_penalty;
    this.projectileVelocity = data.projectile_velocity;
    this.gravity = data.gravity;
    this.parachuteDecceleration = data.parachute_decceleration;
    this.copterSpawnMinY = data.copter_spawn_min_y;
    this.copterSpawnMaxY = data.copter_spawn_max_y;
    this.copterMinVelocity = data.copter_min_velocity;
    this.copterMaxVelocity = data.copter_max_velocity;
    this.parachuteOpenAltitude = data.parachute_open_altitude;
    this.parachuteOpenVelocityThreshold = data.parachute_open_velocity_threshold;
  }

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