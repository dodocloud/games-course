class Brainbot extends Unit {
 
  private damage: number;
  private currentWeapon: WeaponType;
 
  constructor() {
    super(UnitType.BRAIN_BOT);
  }
 
  init(damage: number, currentWeapons: WeaponType) {
    this.damage = damage;
    this.currentWeapon = currentWeapons;
  }
}