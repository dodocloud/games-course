import { ParatrooperModel } from './ParatrooperModel';
import Component from "../../ts/engine/Component";
import { ATTR_MODEL } from './constants';

export class ScoreComponent extends Component {

    onUpdate(delta, absolute) {
        let model = this.scene.root.getAttribute<ParatrooperModel>(ATTR_MODEL);
        let score = "SCORE: " + model.score.toFixed(2);

        let text = <PIXI.Text>this.owner.getPixiObj();
        text.text = score;
    }
}

export class LivesComponent extends Component {

    onUpdate(delta, absolute) {
        let model = this.scene.root.getAttribute<ParatrooperModel>(ATTR_MODEL);
        let lives = "LIVES: " + Math.max(0, model.maxLandedUnits - model.landedUnits);

        let text = <PIXI.Text>this.owner.getPixiObj();
        text.text = lives;
    }
}