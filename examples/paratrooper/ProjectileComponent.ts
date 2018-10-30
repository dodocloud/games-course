import { ATTR_DYNAMICS } from './constants';
import Component from "../../ts/engine/Component";
import Dynamics from './Dynamics';
import { Point } from 'pixi.js';


export class ProjectileComponent extends Component {

    onUpdate(delta, absolute) {
        let dynamics = this.owner.getAttribute<Dynamics>(ATTR_DYNAMICS);
        dynamics.update(delta, 1);
        let deltaPos = dynamics.calcDelta(delta, 1);

        let pixi = this.owner.getPixiObj();
        pixi.position.x += deltaPos.x;
        pixi.position.y += deltaPos.y;

        // check boundaries
        let globalPos = pixi.toGlobal(new Point(0,0));
        if (globalPos.x < 0 || globalPos.x > this.scene.app.screen.width || globalPos.y < 0 || globalPos.y > this.scene.app.screen.height) {
            this.owner.remove();
        }
    }
}