import * as PIXI from 'pixi.js';
import * as ECS from '../../../libs/pixi-ecs';
import { FontParser } from './font-parser';
import { DialogController, Assets, Attributes } from './dialog-controller';
import { ECSExample, getBaseUrl } from '../../utils/APHExample';

export class Dialog extends ECSExample {

	load() {
		// must be done before we load the textures
		PIXI.settings.ROUND_PIXELS = true;
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

		this.engine.app.loader
			.reset()
			.add(Assets.DIALOG_TEXTURE, `${getBaseUrl()}/assets/others/dialog/dialog.png`)
			.add(Assets.FONT, `${getBaseUrl()}/assets/others/dialog/font.json`)
			.add(Assets.FONT_TEXTURE, `${getBaseUrl()}/assets/others/dialog/font.png`)
			.add(Assets.MARKER_TEXTURE, `${getBaseUrl()}/assets/others/dialog/marker.png`)
			.load(() => this.onAssetsLoaded())
	}

	onAssetsLoaded() {
		const scene = this.engine.scene;
		scene.addGlobalComponent(new ECS.KeyInputComponent());

		const fontData = this.engine.app.loader.resources[Assets.FONT].data; 
		const fontTxt = PIXI.Texture.from(Assets.FONT_TEXTURE);
		const font = new FontParser().parseFont(fontData, fontTxt);

		scene.assignGlobalAttribute(Attributes.FONT, font);

		scene.addGlobalComponent(new DialogController({
			text: 'Vanquish Thy foes, brave warrior. And prepare yourself for the greatest of challenges.',
			dialogHeight: 40,
		}))

	}
}
