import * as PIXI from 'pixi.js';
import { PIXIExample, getBaseUrl } from '../utils/APHExample';

/**
 * Sprite for pixel-perfect hit test
 */
class HitTestSprite extends PIXI.Sprite {

	constructor(texture: PIXI.Texture) {
		super(texture);
	}

	containsPoint(point: PIXI.Point): boolean {
		const globalPoint = new PIXI.Point();

		// get global coordinates
		this.worldTransform.applyInverse(point, globalPoint);

		// _texture is private
		const width = (<any>this)._texture.orig.width;
		const height = (<any>this)._texture.orig.height;
		// local coords of top-left border
		const x1 = -width * this.anchor.x;
		const y1 = -height * this.anchor.y;

		let isInside = false;

		if (globalPoint.x >= x1 && globalPoint.x < x1 + width) {
			if (globalPoint.y >= y1 && globalPoint.y < y1 + height) {
				isInside = true;
			}
		}

		if (!isInside) {
			return false;
		}

		// bitmap check
		const tex = this.texture;
		const baseTex = this.texture.baseTexture as any;
		if (!baseTex.hitmap) {
			// generate hitmap, threshold is 127 (half-opaque)
			if (!this.genHitMap(baseTex, 127)) {
				return true;
			}
		}

		const hitmap = baseTex.hitmap;
		const res = baseTex.resolution;
		// this does not account for rotation!!!
		let dx = Math.round((globalPoint.x - x1 + tex.frame.x) * res);
		let dy = Math.round((globalPoint.y - y1 + tex.frame.y) * res);
		let num = dx + dy * baseTex.hitmapWidth;
		let num32 = num / 32 | 0;
		let numRest = num - num32 * 32;
		if (numRest === 31) {
			// there are rounding errors close to the border
			return (hitmap[num32] & (1 << numRest)) > 0 || (hitmap[num32] & (1 << (numRest - 1))) > 0;
		} else {
			return (hitmap[num32] & (1 << numRest)) > 0;
		}
	}

	genHitMap(baseTex: any, threshold: number) {
		if (!baseTex.resource) {
			//renderTexture
			return false;
		}
		const imgSource = baseTex.resource.source;
		let canvas = null;
		if (!imgSource) {
			return false;
		}
		let context = null;
		if (imgSource.getContext) {
			canvas = imgSource;
			context = canvas.getContext('2d');
		} else if (imgSource instanceof Image) {
			canvas = document.createElement('canvas');
			canvas.width = imgSource.width;
			canvas.height = imgSource.height;
			context = canvas.getContext('2d');
			context.drawImage(imgSource, 0, 0);
		} else {
			//unknown source;
			return false;
		}

		const w = canvas.width, h = canvas.height;
		const imgData = context.getImageData(0, 0, w, h);
		const hitmap = new Uint32Array(Math.ceil(w * h / 32));

		// generate hitmap. For 320x320 the size will be sqrt(3200)xsqrt(3200) -> 56x56
		for (let j = 0; j < h; j++) {
			for (let i = 0; i < w; i++) {
				const num = j * w + i; // cell number
				const num32 = num / 32 | 0; // same as Math.floor(num/32)
				const numRest = num - num32 * 32; // values 0-31

				if (imgData.data[4 * num + 3] >= threshold) {
					hitmap[num32] |= (1 << numRest); // set 0-31st bit
				}
			}
		}
		baseTex.hitmap = hitmap;
		baseTex.hitmapWidth = w;
		return true;
	}
}

export class PixiHitTest extends PIXIExample {
	private sonic: PIXI.Sprite;

	load() {
		this.sonic = new HitTestSprite(PIXI.Texture.from(`${getBaseUrl()}/assets/02-pixi-intro/sonic.png`));
		this.sonic.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
		this.sonic.anchor.set(0.5);
		this.sonic.interactive = true;

		this.sonic.on('mouseover', () => {
			this.sonic.tint = 0xff0000;
		});

		this.sonic.on('mouseout', () => {
			this.sonic.tint = 0xffffff;
		});

		this.app.stage.addChild(this.sonic);
	}

	update(deltaTime: number) {
		// no-op
	}
}