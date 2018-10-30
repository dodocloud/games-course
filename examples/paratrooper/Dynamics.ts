
import Vec2 from './Vec2';

export default class Dynamics {
    acceleration = new Vec2(0);
    velocity = new Vec2(0);
    angularSpeed = 0;

    update(delta: number, gameSpeed: number) {
        this.velocity = this.velocity.add(this.acceleration.multiply(delta * gameSpeed));
    }

    calcDelta(delta: number, gameSpeed: number): Vec2 {
        return this.velocity.multiply(delta * gameSpeed);
    }
}