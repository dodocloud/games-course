
export class SpriteInfo {
	type: string;
	offsetX: number;
	offsetY: number;
	width: number;
	height: number;

	constructor(type: string, offsetX: number, offsetY: number, width: number, height: number) {
		this.type = type;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.width = width;
		this.height = height;
	}

	toRectangle(){
		return new PIXI.Rectangle(this.offsetX, this.offsetY, this.width, this.height);
	}
}

export class SpritesData {
	road =  new SpriteInfo("", 2, 163, 169, 134);
	bgr_left = [
		new SpriteInfo("grass", 397, 332, 95, 161),
		new SpriteInfo("forest", 197, 163, 95, 161),
		new SpriteInfo("forest", 397, 163, 95, 161),
		new SpriteInfo("forest", 197, 332, 95, 161),
	];
	bgr_right = [
		new SpriteInfo("grass", 397, 332, 95, 161),
		new SpriteInfo("forest", 197, 163, 95, 161),
		new SpriteInfo("truck", 297, 163, 95, 161),
		new SpriteInfo("house", 297, 332, 95, 161),
	];
	car = new SpriteInfo("", 128, 13, 34, 74);
	car_destroyed = new SpriteInfo("", 165, 13, 34, 74);
	bar_cover = new SpriteInfo("", 2, 301, 25, 204);
	bar_fill = new SpriteInfo("", 34, 301, 25, 209);
	life = new SpriteInfo("", 81, 343, 79, 40);
	obstacles = [
		new SpriteInfo("truck", 8,13,39,106),
		new SpriteInfo("truck", 48, 13, 39, 106),
		new SpriteInfo("car", 87, 13, 38, 71),
		new SpriteInfo("car", 203, 13, 34, 74),
		new SpriteInfo("car", 240, 13, 34, 74),
		new SpriteInfo("truck", 280, 13, 34, 95),
		new SpriteInfo("car", 320, 13, 29, 65),
		new SpriteInfo("truck", 354, 13, 42, 92),
		new SpriteInfo("static", 10, 121, 27, 34),
		new SpriteInfo("static", 47, 119, 27, 3)
	];
}