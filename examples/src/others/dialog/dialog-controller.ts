import * as PIXI from 'pixi.js';
import * as ECS from '../../../libs/pixi-ecs';
import { Font } from './font';
import { DialogModel } from './dialog-model';

type DialogControllerProps = {
	text: string;
	dialogHeight: number;
}

type DialogControllerState = {
	currentOffsetX?: number,
	currentRow?: number,
	waitingForInput?: boolean,
}

export enum Assets {
	FONT = 'font',
	FONT_TEXTURE = 'font_texture',
	DIALOG_TEXTURE = 'dialog_texture',
	MARKER_TEXTURE = 'marker_texture',
}

export enum Attributes {
	FONT = 'font'
}

export class DialogController extends ECS.Component<DialogControllerProps> {
	private state: DialogControllerState;
	private model: DialogModel;
	private keyInputCmp: ECS.KeyInputComponent;
	private dialog: ECS.Container;

	private font: Font;
	private fontTexture: PIXI.Texture;
	private markerTexture: PIXI.Texture;
	private dialogTexture: PIXI.Texture;

	private textMargin = 10;
	private letterSpacing = 0;
	private scale = 4;
	private lettersPerFrame = 1

	onInit() {
		super.onInit();

		this.state = {
			currentOffsetX: 0,
			currentRow: 0,
			waitingForInput: false,
		}

		this.font = this.scene.getGlobalAttribute<Font>(Attributes.FONT);
		this.fontTexture = PIXI.Texture.from(Assets.FONT_TEXTURE);
		this.dialogTexture = PIXI.Texture.from(Assets.DIALOG_TEXTURE);
		this.markerTexture = PIXI.Texture.from(Assets.MARKER_TEXTURE);

		this.dialog = new ECS.NineSlicePlane('dialog_plane', this.dialogTexture, 18, 10, 18, 10);
		// cover whole scene
		this.dialog.width = this.scene.width / this.scale;
		this.dialog.height = this.props.dialogHeight;
		this.dialog.position.y = this.scene.height - (this.dialog.height * this.scale) - 5; // show it 5 pixels from the bottom
		this.dialog.scale.set(this.scale);
		this.scene.stage.addChild(this.dialog);
		this.keyInputCmp = this.scene.findGlobalComponentByName(ECS.KeyInputComponent.name);

		const visibleRows = Math.floor((this.props.dialogHeight - this.textMargin * 2) / this.font.blockHeight);
		const lineWidth = ((this.scene.width / this.scale - 2 * this.textMargin));

		if (visibleRows <= 0) {
			throw new Error('Dialog size doesn\'t allow to display any row');
		}

		this.model = new DialogModel({
			font: this.font,
			text: this.props.text,
			letterSpacing: this.letterSpacing,
			lineWidth,
			visibleRows
		});
	}

	onUpdate() {
		if (this.state.waitingForInput && this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_SPACE)) {
			this.keyInputCmp.handleKey(ECS.Keys.KEY_SPACE);
			if (this.model.canGotoNextLine()) {
				this.gotoNextLine();
			} else {
				// nothing more to display
				this.dialog.destroy();
				this.finish();
			}
		}

		if (!this.state.waitingForInput) {
			const newLetters = this.model.getNextLetters(this.lettersPerFrame);
			this.displayNewLetters(newLetters);

			if (!this.model.canGetNextLetters()) {
				// wait until the player has pressed a button
				this.updateState({
					waitingForInput: true
				});
			}
		}
	}

	private displayNewLetters(letters: string) {
		for (let char of letters) {
			if (char === '\n') {
				this.updateState({
					currentOffsetX: 0,
					currentRow: this.state.currentRow + 1,
				})
				continue;
			}

			const charData = this.font.getCharData(char);
			// we have to clone it, as we need to set up FRAME
			const charTexture = this.fontTexture.clone();
			const spr = new PIXI.Sprite(charTexture);
			spr.position.x = this.textMargin + this.state.currentOffsetX;
			// +1 is for vertical spacing
			spr.position.y = this.textMargin + this.state.currentRow * (this.font.blockHeight + 1) + charData.offsetY;

			charTexture.frame = this.font.getCharFrame(char);
			this.dialog.addChild(spr);

			this.updateState({
				currentOffsetX: this.state.currentOffsetX + (charData.width + this.letterSpacing)
			});
		}

		if (!this.model.canGetNextLetters() && this.model.canGotoNextLine()) {
			// display animated hint
			this.displayMarker();
		}
	}
	private gotoNextLine() {
		this.model.gotoNextLine();
		this.dialog.destroyChildren();
		this.updateState({
			waitingForInput: false,
			currentOffsetX: 0,
			currentRow: 0
		})
	}

	private updateState(state: DialogControllerState) {
		this.state = {
			...this.state,
			...state,
		}
	}

	private displayMarker() {
		const spr = new ECS.Sprite('marker', this.markerTexture.clone());
		spr.position.x = this.textMargin + this.state.currentOffsetX + 2;
		spr.position.y = this.textMargin + this.state.currentRow * (this.font.blockHeight + 1);
		this.dialog.addChild(spr);

		const initPos = spr.position.y;
		// add flickering animation
		spr.addComponent(new ECS.FuncComponent('animator').setFixedFrequency(10).doOnFixedUpdate(() => {
			spr.position.y = initPos + (spr.position.y - initPos + 1) % 5;
		}));
	}
}