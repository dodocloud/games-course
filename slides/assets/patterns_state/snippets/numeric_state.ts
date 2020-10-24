// stateless, the creature will jump each frame
updateCreature() {
  if(eventSystem.isPressed(KeyCode.UP)) {
    this.creature.jump();
  }
}
 
// introduction of a state
updateCreature() {
  if(eventSystem.isPressed(KeyCode.UP) && this.creature.state !== STATE_JUMPING) {
    this.creature.changeState(STATE_JUMPING);
    this.creature.jump();
  }
}