if(asteroid.position.distance(rocket.position) <= MIN_PROXIMITY) { // detect proximity
  rocket.runAnimation(ANIM_EXPLOSION); // react instantly and handle everything
  asteroid.runAnimation(ANIM_EXPLOSION);
  playSound(SOUND_EXPLOSION);
  asteroid.destroy();
  rocket.destroy();
}