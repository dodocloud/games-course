export type Character = {
	index: number;
	offsetY: number;
	width: number;
	height: number;
}

export class Font {
	name: string;
	blockWidth: number;
	blockHeight: number;
	chars: Map<string, Character>;
	texture: PIXI.Texture;

	constructor(name: string, blockWidth: number, blockHeight: number, chars: Map<string, Character>, texture: PIXI.Texture) {
		this.name = name;
		this.blockWidth = blockWidth;
		this.blockHeight = blockHeight;
		this.chars = chars;
		this.texture = texture;
	}

	getCharData(char: string): Character {
		return this.chars.get(char) || this.chars.get('?');
	}

	getCharFrame(char: string): PIXI.Rectangle {
		const letter = this.getCharData(char);
		const lettersPerRow = Math.floor(this.texture.width / this.blockWidth);

		return new PIXI.Rectangle((letter.index % lettersPerRow) * this.blockWidth + 1, // 1 because the texture is shifted
			Math.floor(letter.index / lettersPerRow) * this.blockHeight, letter.width, letter.height);
	}
}