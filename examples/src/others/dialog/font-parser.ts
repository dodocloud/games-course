import { Character, Font } from './font';

export type RawFontData = {
	name: string;
	blockWidth: number;
	blockHeight: number;
	chars: {
		[key: string]: Character
	};
}

export class FontParser {
	parseFont(font: RawFontData, texture: PIXI.Texture): Font {
		const chars = new Map<string, Character>();

		for (let key of Object.keys(font.chars)) {
			const charData = font.chars[key];
			chars.set(key, {
				offsetY: 0,
				width: font.blockWidth,
				height: font.blockHeight,
				...charData
			});
		}
		return new Font(font.name, font.blockWidth, font.blockHeight, chars, texture);
	}
}
