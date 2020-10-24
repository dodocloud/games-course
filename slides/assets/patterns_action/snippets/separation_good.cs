// collision-system.ts
let collisions = this.collisionSystem.checkProximity(allGameObjects);
collisions.forEach(colliding => this.sendEvent(COLLISION_TRIGGERED, colliding));
// rocket-handler.ts
onCollisionTriggered(colliding) {
  this.destroy();
  this.sendEvent(ROCKET_DESTROYED);
}
// sound-component.ts
onGameObjectDestroyed() {
  this.playSound(SOUND_EXPLOSION);
}