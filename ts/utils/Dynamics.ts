
import Vec2 from './Vec2';

/**
 * Storage for aceleration and velocity 
 */
export default class Dynamics {
    aceleration: Vec2;
    velocity: Vec2;

    constructor(velocity = new Vec2(0, 0), aceleration = new Vec2(0, 0)){
        this.velocity = velocity;
        this.aceleration = aceleration;
    }

    applyVelocity(delta: number, gameSpeed: number) {
        this.velocity = this.velocity.add(this.aceleration.multiply(delta * 0.001 * gameSpeed));
    }

    calcPositionChange(delta: number, gameSpeed: number): Vec2 {
        return this.velocity.multiply(delta * 0.001 * gameSpeed);
    }
}