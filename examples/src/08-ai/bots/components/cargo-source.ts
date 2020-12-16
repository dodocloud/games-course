import * as ECS from '../../../../libs/pixi-ecs';
import { GameModel, CargoSourceModel } from '../model';
import { Attributes } from '../constants';

export class CargoSource extends ECS.Component {
	gameModel: GameModel;
	model: CargoSourceModel;
	renderer: ECS.Text;

	constructor(model: CargoSourceModel) {
		super();
		this.model = model;
	}

	onInit() {
		this.gameModel = this.scene.getGlobalAttribute(Attributes.GAME_MODEL);
		// inject graphics renderer
		this.renderer = new ECS.Text('', '');
		this.renderer.style = new PIXI.TextStyle({
			fill: '0x000000',
			fontStyle: 'bold',
			fontSize: '30pt'
		});
		this.owner.addChild(this.renderer);
	}

	onUpdate(delta: number, absolute: number) {
		// draw status
		this.renderer.text = `${this.model.currentAmount}`;
		this.owner.alpha = this.model.currentAmount > 20 ? 1 : (this.model.currentAmount > 0) ? 0.5 : 0.1;
	}
}