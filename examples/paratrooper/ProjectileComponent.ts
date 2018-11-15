import { DynamicsComponent } from './../../ts/components/DynamicsComponent';
import { Point } from 'pixi.js';

/**
 * Movement logic for projectile
 */
export class ProjectileComponent extends DynamicsComponent {

    onUpdate(delta, absolute) {
        super.onUpdate(delta, absolute);

        // check boundaries
        let globalPos = this.owner.getPixiObj().toGlobal(new Point(0, 0));
        if (globalPos.x < 0 || globalPos.x > this.scene.app.screen.width || globalPos.y < 0 || globalPos.y > this.scene.app.screen.height) {
            this.owner.remove();
        }
    }
}