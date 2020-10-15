var world = new World();
world
  .registerSystem(MoveSystem)
  .registerSystem(RendererSystem);
  
class MoveSystem extends System {
  execute(delta, time) {
    this.queries.moving.results.forEach(entity => {
      let pos = entity.getMutableComponent(Position);
      pos.x += entity.getComponent(Velocity).x;
    });
  }
}