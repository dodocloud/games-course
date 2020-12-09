import { APHExample, getBaseUrl } from '../utils/APHExample';

/**
 * Player element (position, keybindings and update function)
 */
class Player {
	// position
	posX = 0;
	posY = 0;

	// direction
	dirX = 1.0;
	dirY = 0.0;

	// camera
	camX = 0.0;
	camY = 0.66; // FOV: 66°

	// player and rotation speed
	speed = 0.12;
	rotspeed = 0.1;

	up = false;
	down = false;
	right = false;
	left = false;

	allowUpdate = true;

	constructor(initPosX: number, initPosY: number) {
		// place the player to the center
		this.posX = initPosX + 0.5;
		this.posY = initPosY + 0.5;
	}

	init() {
		document.addEventListener('keydown', this.keyDown, false);
		document.addEventListener('keyup', this.keyUp, false);
	}

	update(map: GameMap) {
		if (!this.allowUpdate) {
			return;
		}

		let diffX = this.dirX * this.speed;
		let diffY = this.dirY * this.speed;

		// update movement
		if (this.up) {
			if (map.isFree(Math.floor(this.posX + diffX), Math.floor(this.posY))) {
				this.posX += diffX;
			}
			if (map.isFree(Math.floor(this.posX), Math.floor(this.posY + diffY))) {
				this.posY += diffY;
			}
		}

		if (this.down) {
			if (map.isFree(Math.floor(this.posX - diffX), Math.floor(this.posY))) {
				this.posX -= diffX;
			}
			if (map.isFree(Math.floor(this.posX), Math.floor(this.posY - diffY))) {
				this.posY -= diffY;
			}
		}

		// update camera orientation based on rotation
		let cosRotspeedp = Math.cos(this.rotspeed);
		let cosRotspeedn = Math.cos(-this.rotspeed);
		let sinRotspeedp = Math.sin(this.rotspeed);
		let sinRotspeedn = Math.sin(-this.rotspeed);

		if (this.left) {
			let dirX = this.dirX;
			this.dirX = dirX * cosRotspeedn - this.dirY * sinRotspeedn;
			this.dirY = dirX * sinRotspeedn + this.dirY * cosRotspeedn;

			let camX = this.camX;
			this.camX = camX * cosRotspeedn - this.camY * sinRotspeedn;
			this.camY = camX * sinRotspeedn + this.camY * cosRotspeedn;
		}

		if (this.right) {
			let dirX = this.dirX;
			this.dirX = dirX * cosRotspeedp - this.dirY * sinRotspeedp;
			this.dirY = dirX * sinRotspeedp + this.dirY * cosRotspeedp;

			let camX = this.camX;
			this.camX = camX * cosRotspeedp - this.camY * sinRotspeedp;
			this.camY = camX * sinRotspeedp + this.camY * cosRotspeedp;
		}

	}

	// WSAD
	keyDown = (event: KeyboardEvent) => {
		if (event.keyCode === 65) { this.left = true; }
		if (event.keyCode === 68) { this.right = true; }
		if (event.keyCode === 87) { this.up = true; }
		if (event.keyCode === 83) { this.down = true; }
	}

	keyUp = (event: KeyboardEvent) => {
		if (event.keyCode === 65) { this.left = false; }
		if (event.keyCode === 68) { this.right = false; }
		if (event.keyCode === 87) { this.up = false; }
		if (event.keyCode === 83) { this.down = false; }
	}

	destroy() {
		document.removeEventListener('keydown', this.keyDown);
		document.removeEventListener('keyup', this.keyUp);
	}
}

/**
 * Map item (sprite)
 */
class Item {
	name: string;
	posX: number;
	posY: number;
	size: number;
	texture: any;

	constructor(name: string, posX: number, posY: number, size: number, texture: any) {
		this.name = name;
		this.posX = posX;
		this.posY = posY;
		this.size = size;  // 0..1 (for a 256x256 wall texture)
		this.texture = texture;
	}

	/**
	 * Gets squared distance from point [x,y]
	 */
	distance(x: number, y: number): number {
		return Math.pow(x - this.posX, 2) + Math.pow(y - this.posY, 2);
	}
}

/**
 * Structure of map elements
 */
class MapItems {
	// texture for every object type
	textures: Array<HTMLImageElement> = [];
	// collection of objects
	items: Array<Item> = [];

	constructor() {
		// so far only one object type is supported
		this.textures[0] = new Image();
		this.textures[0].src = `${getBaseUrl()}/assets/07-graphics/raycaster/object.png`;
	}

	/**
	 * Adds a new object
	 * @param name name of the object
	 * @param x position along x-axis
	 * @param y position along y-axis
	 * @param size size [0..1] for 256x256 tex
	 * @param texture link to the texture
	 */
	add(name: string, x: number, y: number, size: number, texture: number) {
		this.items[this.items.length] = new Item(name, x, y, size, texture);
	}

	remove(index: number) {
		delete this.items[index];
	}

	/**
	 * Returns collection of all objects sorted by their distance to [x,y]
	 * Used to sort sprites based on their distance to the player
	 */
	sorted(x: number, y: number): Array<Item> {
		let t = [];
		// store objects and their distance
		for (let item of this.items) {
			t[t.length] = item;
			(<any>item).dist = item.distance(x, y); // create temporary attribute for the distance
		}
		// return objects sorted by their distance
		return t.sort((a: any, b: any) => { return b.dist - a.dist; });
	}

	getTexture(index: number): HTMLImageElement {
		return this.textures[index];
	}
}

/**
 * Structure of the map
 */
class GameMap {
	// FREE = 0
	// BLOCK = 1
	data = [
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1,
		1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1,
		1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1,
		1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1,
		1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1,
		1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1,
		1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1,
		1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1,
		1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1,
		1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
		1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
		1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
		1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
		1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1,
		1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
	];

	width = 20;
	height = 20;

	wallTextures: Array<HTMLImageElement> = [];

	// gradients for floor and ceilings
	floor0 = 'rgb(0, 0, 0)';
	floor1 = 'rgb(20, 20, 20)';
	ceiling0 = 'rgb(0, 0, 0)';
	ceiling1 = 'rgb(80, 20, 20)';

	items = new MapItems();

	constructor() {
		// so far only one wall texture is supported
		this.wallTextures[0] = new Image();
		this.wallTextures[0].src = `${getBaseUrl()}/assets/07-graphics/raycaster/wall.jpg`;

		this.items.add('item', 3.5, 1.5, 0.2, 0);
		this.items.add('item', 7.5, 2.25, 0.2, 0);
		this.items.add('item', 7.5, 2.75, 0.2, 0);
	}

	getTextureByIndex(index: number): HTMLImageElement {
		return this.wallTextures[index];
	}

	getTextureByPosition(x: number, y: number): HTMLImageElement {
		return this.getTextureByIndex(this.data[y * this.width + x] - 1);
	}

	/**
	 * Returns true if the path is free at selected coordinate
	 */
	isFree(x: number, y: number): boolean {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return false;
		}
		return this.data[y * this.width + x] === 0;
	}
}

export class Raycaster implements APHExample {
	// for preview mode
	lastLoopCol = 0;
	previewZBuffer: number[];
	previewStep = 8;
	previewDownScale = 8;

	running: boolean;
	canvas: HTMLCanvasElement;

	ctx: CanvasRenderingContext2D;

	map = new GameMap();
	player = new Player(1, 1);

	// canvas size
	width: number;
	height: number;

	init(canvas: HTMLCanvasElement | string) {
		if(typeof(canvas) === 'string') {
			this.canvas = document.getElementById(canvas) as HTMLCanvasElement;
		}  else {
			this.canvas = canvas as HTMLCanvasElement;
		}
		if (this.canvas.getContext) {
			this.width = this.canvas.width;
			this.height = this.canvas.height;
			this.canvas.style.background = 'rgb(0, 0, 0)';
			this.ctx = this.canvas.getContext('2d');
		}
		this.player.init();
		this.running = true;
		this.loop();
	}

	loop() {
		if (this.running) {
			// attach to requestAnimationFrame
			requestAnimationFrame(() => this.loop());
			// update player inputs
			this.player.update(this.map);
			// draw everything
			this.draw();
		}
	}

	destroy() {
		this.running = false;
		document.removeEventListener('keydown', this.player.keyDown);
		document.removeEventListener('keyup', this.player.keyUp);
		this.player.destroy();
	}

	private draw() {
		this.ctx.clearRect(0, 0, this.width, this.height);

		this.drawBackground();

		// distance to the wall for every column, used for sprites
		let zBuffer: Array<number> = [];

		// the magic happens right here
		// for every vertical line, use raycasting to render textures
		for (let col = 0; col < this.width; col++) {
			this.drawColumn(col, zBuffer);
		}

		// draw sprites
		this.drawSprites(zBuffer);
	}

	private drawColumn(col: number, zBuffer: number[], wallWidth: number = 1) {
		let camera = 2 * col / this.width - 1; // camera coordinate scaled to [-1..1]
		let rayX = this.player.posX;
		let rayY = this.player.posY;
		let rayDirX = this.player.dirX + this.player.camX * camera;
		let rayDirY = this.player.dirY + this.player.camY * camera;

		// get integer coordinates for iterative steps
		let mx = Math.floor(rayX);
		let my = Math.floor(rayY);

		let deltaX = Math.sqrt(1 + (rayDirY * rayDirY) / (rayDirX * rayDirX));
		let deltaY = Math.sqrt(1 + (rayDirX * rayDirX) / (rayDirY * rayDirY));

		// distance to the border of the cell (integer part of the position)
		let distX = 0;
		let distY = 0;

		// direction for ray-collisions (forward or backward)
		let stepX = 0;
		let stepY = 0;

		// initial step for the ray
		if (rayDirX < 0) {
			stepX = -1;
			distX = (rayX - mx) * deltaX; // fractional part
		} else {
			stepX = 1;
			distX = (mx + 1 - rayX) * deltaX;
		}
		if (rayDirY < 0) {
			stepY = -1;
			distY = (rayY - my) * deltaY; // fractional part
		} else {
			stepY = 1;
			distY = (my + 1 - rayY) * deltaY;
		}

		let horiz = false;

		// ray-wall collision calculation
		while (true) {
			if (distX < distY) {
				distX += deltaX;
				mx += stepX;
				horiz = true; // collision with horizontal wall
			} else {
				distY += deltaY; // collision with vertical wall
				my += stepY;
				horiz = false;
			}

			if (!this.map.isFree(mx, my)) {
				break;
			}
		}

		let wallDist = 0;
		let wallX = 0;

		// calculating distance to the wall
		if (horiz) {
			// horizontal wall
			wallDist = (mx - rayX + (1 - stepX) / 2) / rayDirX;
			wallX = rayY + ((mx - rayX + (1 - stepX) / 2) / rayDirX) * rayDirY;
		} else {
			// vertical wall
			wallDist = (my - rayY + (1 - stepY) / 2) / rayDirY;
			wallX = rayX + ((my - rayY + (1 - stepY) / 2) / rayDirY) * rayDirX;
		}

		// round X coord
		wallX -= Math.floor(wallX);

		if (wallDist < 0) {
			wallDist = -wallDist;
		}

		// save the distance into zBuffer
		zBuffer[col] = wallDist;

		let wallHeight = Math.abs(Math.floor(this.height / wallDist));
		let drawStart = -wallHeight / 2 + this.height / 2;

		wallX = Math.floor(wallX * this.map.getTextureByPosition(mx, my).width);
		if (horiz && rayDirX > 0) {
			wallX = this.map.getTextureByPosition(mx, my).width - wallX - 1;
		}
		if (!horiz && rayDirY < 0) {
			wallX = this.map.getTextureByPosition(mx, my).width - wallX - 1;
		}

		this.drawWall(mx, my, col, wallX, drawStart, wallHeight, wallWidth);
	}

	private drawBackground() {
		// draw floor gradient
		let grad = this.ctx.createLinearGradient(0, this.height / 2, 0, this.height);
		grad.addColorStop(0, this.map.floor0);
		grad.addColorStop(1, this.map.floor1);
		this.ctx.fillStyle = grad;
		this.ctx.fillRect(0, this.height / 2, this.width, this.height / 2);

		// draw ceiling gradient
		grad = this.ctx.createLinearGradient(0, 0, 0, this.height / 2);
		grad.addColorStop(1, this.map.ceiling0);
		grad.addColorStop(0, this.map.ceiling1);
		this.ctx.fillStyle = grad;
		this.ctx.fillRect(0, 0, this.width, this.height / 2);
	}

	private drawWall(mx: number, my: number, col: number, wallX: number, drawStart: number, wallHeight: number, wallWidth: number = 1) {
		let tex = this.map.getTextureByPosition(mx, my);
		this.ctx.drawImage(tex, wallX, 0, 1, tex.height, col, drawStart, wallWidth, wallHeight);

		// calculate shadow light
		let tint = 1 - (wallHeight * 1.6) / this.height;
		this.ctx.fillStyle = 'rgba(0,0,0,' + tint + ')';
		this.ctx.fillRect(col, drawStart, wallWidth, wallHeight);
	}

	private drawSprites(zBuffer: Array<number>, colWidth: number = 1) {

		// get all sprites sorted by their distance to the player
		let sprites = this.map.items.sorted(this.player.posX, this.player.posY);

		for (let i = 0; i < sprites.length; i++) {
			let spriteDistX = sprites[i].posX - this.player.posX;
			let spriteDistY = sprites[i].posY - this.player.posY;

			let inv = 1.0 / (this.player.camX * this.player.dirY - this.player.dirX * this.player.camY);
			// calculate transform
			let transX = inv * (this.player.dirY * spriteDistX - this.player.dirX * spriteDistY);
			let transY = inv * (-this.player.camY * spriteDistX + this.player.camX * spriteDistY);
			// position on screen along X axis
			let screenX = Math.floor((this.width / 2) * (1 + transX / transY));

			let spriteScale = Math.abs(Math.floor(this.height / transY)) * sprites[i].size;

			// calculate which vertical columns needs this sprite to be rendered to
			let startColY = Math.floor(-spriteScale / 2 + this.height / 2);
			if (startColY < 0) {
				startColY = 0;
			}

			let startColX = Math.floor(-spriteScale / 2 + screenX);
			let texStartX = 0;
			if (startColX < 0) {
				texStartX = -startColX;
				startColX = 0;
			}

			let endColX = Math.floor(spriteScale / 2 + screenX);
			if (endColX >= this.width) {
				endColX = this.width - 1;
			}

			// draw for each occupied vertical column
			for (let col = startColX; col < endColX; col++) {
				if (transY > 0 && col > 0 && col < this.width && transY < zBuffer[col]) {
					let tex = this.map.items.getTexture(sprites[i].texture);
					let texX = Math.floor((col - startColX) * tex.width / spriteScale);
					this.ctx.drawImage(tex, texStartX + texX, 0, 1, tex.height, col, startColY + Math.floor(256 / transY) - spriteScale / 2, colWidth, spriteScale);
				}
			}
		}
	}
}

