// assume only 50% active/visible objects
gameLoop(delta, absolute) {
  for(let entity in this.entities) {
    // 50% mispredictions
    if(entity.ACTIVE) { 
      entity.update(delta, absolute);
    }
    if(entity.VISIBLE) {
      entity.draw();
    }
  }
}