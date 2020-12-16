import * as ECS from '../../../../libs/pixi-ecs';
import { GameModel } from '../model';
import { BotFactory } from '../bot-factory';
import { Attributes } from '../constants';

/**
 * Data component for the warehouse - maintains storage
 */
export class Warehouse extends ECS.Component {
	model: GameModel;
	factory: BotFactory;

	onInit() {
		this.model = this.scene.getGlobalAttribute(Attributes.GAME_MODEL);
		this.factory = this.scene.getGlobalAttribute(Attributes.FACTORY);
	}
}