import * as ECS from '../../../../libs/pixi-ecs';
import { GameModel } from '../model';
import { Attributes } from '../constants';


/**
 * Component that displays an overall game state
 */
export class WarehouseState extends ECS.Component {
	model: GameModel;


	onInit() {
		this.model = this.scene.getGlobalAttribute(Attributes.GAME_MODEL);
		let text = this.owner.asText();
		text.style = new PIXI.TextStyle({
			fill: '0xcf4512',
			fontStyle: 'bold',
			fontSize: '62pt'
		});
	}

	onUpdate(delta: number, absolute: number) {
		(this.owner.asText()).text = 'IRON: ' +
			this.model.warehouseModel.ironOre + ' \nPETROL: ' + this.model.warehouseModel.petrol
			+ '\nBOTS:' + this.model.botsNum;
	}
}