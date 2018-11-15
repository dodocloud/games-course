import { DynamicsComponent } from './../../ts/components/DynamicsComponent';
import { ParatrooperModel } from './ParatrooperModel';
import { ATTR_MODEL } from './Constants';

/**
 * Simple movement behavior that inverts velocity once the copter reaches boundaries of the scene
 */
export class CopterMovement extends DynamicsComponent {
    model: ParatrooperModel;

    onInit() {
        super.onInit();
        this.model = this.scene.getGlobalAttribute(ATTR_MODEL);
    }

    onUpdate(delta: number, absolute: number) {
        super.onUpdate(delta, absolute);

        let velocity = this.dynamics.velocity;
        // check boundaries
        let globalPos = this.owner.getPixiObj().toGlobal(new PIXI.Point(0,0));

        if ((velocity.x > 0 && globalPos.x > this.owner.getScene().app.screen.width)
            || (velocity.x < 0 && globalPos.x < -this.owner.getPixiObj().width)) {
            velocity.x = -velocity.x;
        }
    }
}