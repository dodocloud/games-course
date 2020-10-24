const superBallTransmuter = (entity: GameObject) => {
    entity.removeComponent<BallBehavior>();
    entity.addComponent(new SuperBallBehavior());
    entity.state.speed = SUPER_BALL_SPEED;
    entity.state.size = SUPER_BALL_SIZE;
    return entity;
}