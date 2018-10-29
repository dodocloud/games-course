
import Component from '../../ts/engine/Component';
import { GameModel, SpriteManager } from './attributes';
import { ATTR_GAME_MODEL, ATTR_SPRITE_MGR } from './constants';
import { simplex2 } from './perlinnoise';

// component that renders the road
export class RoadRenderer extends Component {
	gameModel: GameModel;
	spriteMgr: SpriteManager;

	onInit() {
		this.gameModel = this.scene.getGlobalAttribute(ATTR_GAME_MODEL);
		this.spriteMgr = this.scene.getGlobalAttribute(ATTR_SPRITE_MGR);
	}

	// gets random left background
	getLeftGrass(offset) {
		// use simplex noise for forest and grass
		if (simplex2(1, offset) >= 0)
			return this.spriteMgr.getLeftBgr(3);
		if (offset % 20 == 0)
			return this.spriteMgr.getLeftBgr(2);
		if (offset % 3 == 0)
			return this.spriteMgr.getLeftBgr(1);
		return this.spriteMgr.getLeftBgr(0);
	}

	// gets random right background
	getRightGrass(offset) {
		// use simplex noise for forest and grass
		if (simplex2(200, offset) >= 0)
			return this.spriteMgr.getRightBgr(3);
		if (offset % 20 == 0)
			return this.spriteMgr.getRightBgr(2);

		if (offset % 3 == 0)
			return this.spriteMgr.getRightBgr(1);
		return this.spriteMgr.getRightBgr(0);
	}

	// draws the road and the background
	draw(ctx) {
		
		let cameraPosition = Math.floor(this.gameModel.cameraPosition);

		var posX = this.spriteMgr.getBgrWidth();
		var spriteHeight = this.spriteMgr.getRoad().height;
		var canvasHeight = this.scene.canvas.height;
		
		// calculate number of rendering cycles in order to fill the whole canvas
		var cycles = Math.round(canvasHeight / spriteHeight) + 2; 
		var currentBlock = Math.floor(cameraPosition / spriteHeight) + cycles;

		var position = Math.min(spriteHeight, spriteHeight - cameraPosition % spriteHeight);
		var posY = 0;
		
		for (var i = 0; i < cycles; i++) {
			var sprite = this.spriteMgr.getRoad();
			if (sprite.height - position <= 0) {
				position = 0;
				continue;
			}
			// draw road
			ctx.drawImage(this.spriteMgr.atlas, sprite.offsetX, sprite.offsetY + position,
				sprite.width, sprite.height - position, posX, posY, sprite.width, sprite.height - position);

			// draw left bgr
			var leftGrass = this.getLeftGrass(currentBlock - i);
			ctx.drawImage(this.spriteMgr.atlas, leftGrass.offsetX, leftGrass.offsetY + position,
				leftGrass.width, leftGrass.height - position, 0, posY, leftGrass.width, leftGrass.height - position);

			// draw right bgr
			var rightGrass = this.getRightGrass(currentBlock - i);
			ctx.drawImage(this.spriteMgr.atlas, rightGrass.offsetX, rightGrass.offsetY + position,
				rightGrass.width, rightGrass.height - position, posX + this.spriteMgr.getRoad().width, posY, rightGrass.width, rightGrass.height - position);

			posY += (sprite.height - position);
			position = 0;
		}
	}
}

// renderer for cars and obstacles
export class RoadObjectRenderer extends Component {
	onInit() {
		this.spriteMgr = this.scene.getGlobalAttribute(ATTR_SPRITE_MGR);
		this.gameModel = this.scene.getGlobalAttribute(ATTR_GAME_MODEL);
	}

	draw(ctx) {
		if (this.owner.sprite != null) {
			let cameraPosition = this.gameModel.cameraPosition;

			// posY is actually a coordinate on the road (starting at the very bottom)
			ctx.drawImage(this.spriteMgr.atlas, this.owner.sprite.offsetX, this.owner.sprite.offsetY,
				this.owner.sprite.width, this.owner.sprite.height, this.owner.trans.posX,
				cameraPosition - this.owner.trans.posY, this.owner.sprite.width, this.owner.sprite.height);
		}
	}
}

// component that plays a flickering animation
// used when the game switches to the immune mode
export class FlickerAnimation extends Component {

	constructor(duration) {
		super();
		this.duration = duration;
	}

	oninit() {
		this.frequency = 10;
		this.lastFlicker = 0;
		this.startTime = 0;
	}

	update(delta, absolute) {
		if (this.lastFlicker == 0) {
			this.lastFlicker = absolute;
		}

		if (this.startTime == 0) {
			this.startTime = absolute;
		}

		if ((absolute - this.lastFlicker) > (1000 / this.frequency)) {
			// blink
			this.lastFlicker = absolute;
			if(this.owner.hasState(STATE_DRAWABLE)){
				this.owner.removeState(STATE_DRAWABLE);
			}else{
				this.owner.addState(STATE_DRAWABLE);
			}
		}

		if ((absolute - this.startTime) > this.duration) {
			// finish
			this.owner.addState(STATE_DRAWABLE);
			this.sendmsg(MSG_ANIM_ENDED);
			this.owner.removeComponent(this);
		}
	}
}

// component that renders number of lives
export class LivesComponent extends Component {
	
	oninit() {
		this.spriteMgr = this.scene.getGlobalAttribute(ATTR_SPRITE_MGR);
		this.model = this.scene.getGlobalAttribute(ATTR_GAME_MODEL);
	}

	draw(ctx) {
		let lives = this.model.lives;
		let sprite = this.owner.sprite;

		for (let i = 0; i < lives; i++) {
			ctx.drawImage(this.spriteMgr.atlas, sprite.offsetX, sprite.offsetY,
				sprite.width, sprite.height, 10 + (sprite.width) * i, 20, 
				sprite.width, sprite.height);
		}
	}
}

// component that renders score
export class ScoreDisplayComponent extends Component {

	oninit() {
		this.model = this.scene.getGlobalAttribute(ATTR_GAME_MODEL);
	}

	draw(ctx) {
		let score = Math.floor(this.model.score);
		score = (1e15 + score + "").slice(-4); // hack for leading zeros
		let posX = 20;
		let posY = 100;

		ctx.fillStyle = "rgba(255, 255, 255, 1)";
		ctx.textAlign = 'left';
		ctx.fillText(`${score} m`, posX, posY);
	}
}

// component that renders animated text
export class AnimTextDisplayComponent extends Component {
	
	constructor(text, duration) {
		super();
		this.text = text;
		this.duration = duration;
		this.opacity = 0;
	}

	oninit() {
		this.startTime = 0;
	}

	draw(ctx) {
		ctx.fillStyle = `rgba(255, 255, 255,  ${this.opacity})`;
		ctx.textAlign = 'center';
		ctx.fillText(this.text, this.owner.trans.posX, this.owner.trans.posY);
	}

	update(delta, absolute) {
		if (this.startTime == 0) {
			this.startTime = absolute;
		}

		let progress = (absolute - this.startTime) / this.duration;

		// opacity goes from 0 to 1 and back to 0
		if (progress > 0.5) {
			this.opacity = (1 - progress) * 2;
		} else {
			this.opacity = (progress) * 2;
		}

		if ((absolute - this.startTime) > this.duration) {
			// animation ended -> finish
			this.owner.removeComponent(this);
			this.sendmsg(MSG_ANIM_ENDED);
		}
	}
}

// component that displays speed bar
export class SpeedbarComponent extends Component {
	
	oninit() {
		this.spriteMgr = this.scene.getGlobalAttribute(ATTR_SPRITE_MGR);
		this.car = this.scene.findFirstObjectByTag("car");
	}

	draw(ctx) {
		let barCover = this.spriteMgr.getBarCover();
		let barFill = this.spriteMgr.getBarFill();

		let carSpeed = this.car.getAttribute(ATTR_SPEED);
		let speedRatio = carSpeed / MAXIMUM_SPEED;
		
		let shift = barFill.height * (1 - speedRatio); 

		// draw the filled bar first
		ctx.drawImage(this.spriteMgr.atlas, barFill.offsetX, barFill.offsetY + shift,
			barFill.width, barFill.height - shift, this.owner.trans.posX + 2, this.owner.trans.posY + 2 + shift,
			barFill.width, barFill.height - shift);

		// draw the border
		ctx.drawImage(this.spriteMgr.atlas, barCover.offsetX, barCover.offsetY,
			barCover.width, barCover.height, this.owner.trans.posX, this.owner.trans.posY,
			barCover.width, barCover.height);
	}
}

