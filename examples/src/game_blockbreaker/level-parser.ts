import Level, { BRICK_INDEX_NONE, LevelBuilder } from './level';

export default class LevelParser {

	parse(data: string): Level[] {

		const output: Level[] = [];
		const lines = data.split('\n').filter(line => line !== '' && line.indexOf('#') === -1);

		let levelBuilder: LevelBuilder = null;

		lines.forEach(line => {
			if (line.startsWith(':')) {
				if (levelBuilder) {
					output.push(levelBuilder.build());
				}
				levelBuilder = new LevelBuilder();
				levelBuilder.name = line.substr(1);
				return;
			}

			let colCounter = 0;

			for (let character of line) {
				const digit = (character === '-') ? BRICK_INDEX_NONE : parseInt(character);
				if (isNaN(digit)) {
					continue;
				}

				const index = levelBuilder.columns * levelBuilder.rows + colCounter;
				levelBuilder.bricks[index] = digit;
				if (levelBuilder.rows === 0) {
					levelBuilder.columns = colCounter + 1;
				}
				colCounter++;
			}

			if (colCounter !== 0) {
				levelBuilder.rows++;
			}
		});

		if (levelBuilder) {
			output.push(levelBuilder.build());
		}

		return output;
	}
}