
export const BRICK_INDEX_NONE = -1;

export class LevelBuilder {
	name: string;
	columns: number = 0;
	rows: number = 0;
	bricks: number[] = [];

	build() {
		if (this.rows * this.columns !== this.bricks.length) {
			throw new Error(`Number of rows (${this.rows}) or columns (${this.columns}) doesn't match the number of bricks (${this.bricks.length})`);
		}
		return new Level(this.name, this.columns, this.rows, this.bricks);
	}
}

export default class Level {
	protected _name: string;
	protected _columns: number;
	protected _rows: number;
	protected _bricks: number[];

	constructor(name: string, columns: number, rows: number, bricks: number[]) {
		this._name = name;
		this._columns = columns;
		this._rows = rows;
		this._bricks = bricks;
	}

	get name() {
		return this._name;
	}

	get columns() {
		return this._columns;
	}

	get rows() {
		return this._rows;
	}

	get bricks() {
		return this._bricks;
	}

	getIndex(column: number, row: number) {
		return this.columns * row + column;
	}

	getBrick(column: number, row: number) {
		if (column >= this.columns || row >= this.rows || column < 0 || row < 0) {
			throw new Error(`Coordinates outside bounds: [${column}, ${row}]`);
		}

		const index = this.getIndex(column, row);

		return this._bricks[index];
	}
}