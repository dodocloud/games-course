import { Font } from './font';

export type DialogModelProps = {
	font: Font;
	text: string;
	lineWidth: number;
	letterSpacing: number;
	visibleRows: number;
}

export class DialogModel {

	private props: DialogModelProps;
	// text split by new lines
	private dividedText: string[];
	// text currently visible
	private currentLine: string;
	// text just being displayed by animation
	private currentLineIndex: number;

	private rowsNum: number;
	private currentRow: number;

	constructor(props: DialogModelProps) {
		this.props = props;
		this.dividedText = this.divideText(this.props.text, this.props.lineWidth, this.props.letterSpacing);
		this.rowsNum = this.dividedText.length;
		this.currentRow = -1;
		this.gotoNextLine();
	}

	canGetNextLetters() {
		// index is shifted by 1 -> 0 means that we are just before 0
		return this.currentLineIndex <= this.currentLine.length;
	}

	getNextLetters(num: number) {
		if (this.canGetNextLetters()) {
			const newLettersNum = Math.min(num, this.currentLine.length + 1 - this.currentLineIndex);
			const newLetters = this.currentLine.substring(this.currentLineIndex - 1, this.currentLineIndex + newLettersNum - 1);
			this.currentLineIndex += newLettersNum;
			return newLetters;
		}
		return null;
	}

	canGotoNextLine() {
		return (this.currentRow + this.props.visibleRows) < this.rowsNum;
	}

	gotoNextLine() {
		if (this.currentRow === -1 || this.canGotoNextLine()) {
			if (this.currentRow === -1) {
				this.currentRow = 0;
			} else {
				this.currentRow += this.props.visibleRows;
			}
			this.currentLineIndex = 0;
			const currentVisibleRows = Math.max(this.props.visibleRows, (this.currentRow + this.props.visibleRows) - this.dividedText.length);
			this.currentLine = this.dividedText.slice(this.currentRow, this.currentRow + currentVisibleRows).join('\n');
			return true;
		}
		return false;
	}

	divideText(text: string, maxWidth: number, letterSpacing: number): string[] {
		let output = [];

		const words = text.split(' ');
		const spaceWidth = this.props.font.getCharData(' ').width;
		let currentLine = '';
		let lineLength = 0;

		// we need to get the width of each letter as it may vary
		for (let word of words) {
			// word.length - 1 because we consider letterspacing for a whitespace just below
			const wordLength = this.calcWordLength(word) + ((word.length - 1) * letterSpacing);
			if ((lineLength + wordLength) > maxWidth) {
				// append new line
				output.push(currentLine);
				currentLine = '';
				lineLength = 0;
			}

			// append new word
			if (currentLine.length === 0) {
				currentLine += word;
			} else {
				currentLine += ' ' + word;
			}
			lineLength += (wordLength + (spaceWidth + letterSpacing));
		}

		// append last line
		output.push(currentLine);

		return output;
	}

	private calcWordLength(word: string) {
		let total = 0;
		for (let char of word) {
			total += this.props.font.getCharData(char).width;
		}
		return total;
	}
}
