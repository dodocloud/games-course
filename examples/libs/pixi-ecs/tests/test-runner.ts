import { Scene } from '..';
import { Ticker } from 'pixi.js';


// ====================================================
// Test runner that displays results in a html table
// ====================================================

export const WIDTH = 600;
export const HEIGHT = 600;
export const TIME_STEP = 16.67;
export const TIMEOUT_SECONDS = 10;

export type FinishFunc = (success: boolean, errorMsg?: string) => void;
export type TestFunc = (scene: Scene, onFinish: FinishFunc, tick: () => void) => void;

export class BaseTest {

	protected _isRunning = false;
	protected testFunc: TestFunc;
	protected _name;
	protected currentScene: Scene;
	protected currentTicker: Ticker;
	protected _currentTime = 0;

	constructor(name: string, testFunc: TestFunc) {
		this.testFunc = testFunc;
		this._name = name;
	}

	get name() {
		return this._name;
	}

	get isRunning() {
		return this._isRunning;
	}

	get currentTime() {
		return this._currentTime;
	}

	/**
	 * Function that is invoked before the test is executed 
	 */
	beforeTest(scene: Scene, ticker: Ticker) {
		this.currentScene = scene;
		this.currentTicker = ticker;
		scene.clearScene({});
	}

	/**
	 * Function that is invoked after the test is executed 
	 */
	afterTest() {
		this.stopLoop();
		this.currentScene.clearScene({});
		this.currentScene = null;
	}

	executeTest(onFinish: FinishFunc) {
		this.testFunc(this.currentScene, onFinish, () => this.tick());
	}

	runLoop() {
		this._isRunning = true;
		this._currentTime = 0;
		this.tick();
	}

	stopLoop() {
		this._isRunning = false;
	}

	tick() {
		if (this._isRunning) {
			this._currentTime += TIME_STEP;
			this.update(TIME_STEP, this._currentTime);
		}
	}

	protected update(delta: number, absolute: number) {
		this.currentScene._update(delta, absolute);
		this.currentTicker.update(absolute);
	}
}

export class TestRunner {
	private app: PIXI.Application = null;
	private scene: Scene = null;
	private ticker: PIXI.Ticker = null;
	private infoTable: HTMLElement;
	private currentTestIndex: number;
	private allTests: BaseTest[];

	constructor(allTests: BaseTest[]) {
		this.allTests = allTests;
		this.app = new PIXI.Application({
			width: WIDTH,
			height: HEIGHT,
			view: (document.getElementsByTagName('canvas')[0] as HTMLCanvasElement),
		});

		this.initInfoTable();
		this.scene = new Scene('default', this.app);
		this.ticker = this.app.ticker;
		this.ticker.autoStart = false;
		this.ticker.stop();
		this.addStyles();
		this.runTest(0);
	}

	private runTest(index: number) {
		this.currentTestIndex = index;
		const currentTest = this.allTests[index];
		const name = currentTest.name;
		currentTest.beforeTest(this.scene, this.ticker);
		currentTest.runLoop();

		try {
			this.logPending(name);
			currentTest.executeTest((success, errorMsg) => {
				this.logResult(name, !success ? (errorMsg ? 'FAILURE: ' + errorMsg : 'FAILURE') : 'OK', success);
				currentTest.stopLoop();
			});
			// run loop for all tests
			this.runTestLoop(currentTest, () => this.gotoNextTest());
		} catch (error) {
			console.log(error.stack);
			this.logResult(name, error, false);
			// move on to another test if an error occurs 
			this.gotoNextTest();
		}
	}

	private gotoNextTest() {
		const test = this.allTests[this.currentTestIndex];
		test.afterTest();
		if ((this.currentTestIndex + 1) < this.allTests.length) {
			this.runTest(this.currentTestIndex + 1);
		} else {
			this.currentTestIndex = 0;
		}
	}

	private runTestLoop(test: BaseTest, onFinish: () => void) {
		// run loop until the tests either fails or suceeds

		if (test.isRunning) {
			if (test.currentTime >= (TIMEOUT_SECONDS * 1000)) {
				// interrupt
				test.stopLoop();
				this.logResult(test.name, 'TIMEOUT ' + TIMEOUT_SECONDS + 's', false);
			}
			// ========== perform a tick upon the game engine
			test.tick();
			// ===============================================
			requestAnimationFrame(() => this.runTestLoop(test, onFinish));
		} else {
			onFinish();
		}
	}

	private initInfoTable() {
		this.infoTable = document.getElementById('info');
		if (!this.infoTable) {
			this.infoTable = document.createElement('table');
			let tr = document.createElement('tr');
			tr.innerHTML = '<th>TEST</<th><th>RESULT</th>';
			this.infoTable.appendChild(tr);
			document.getElementsByTagName('body')[0].appendChild(this.infoTable);
		}
	}

	private addStyles() {
		const styles = 'body {' +
			'    background-color: white;' +
			'    font-family: \'Courier New\', Courier, monospace;' +
			'  }' +
			'' +
			'  table {' +
			'    float: left;' +
			'    width: 500px;' +
			'  }' +
			'' +
			'  table td, table th {' +
			'    border: 1px solid black;' +
			'  }' +
			'' +
			'  table td:first-child, table th:first-child {' +
			'    width: 80%;' +
			'  }' +
			'' +
			'  table td:nth-child(2) {' +
			'    font-weight: bold;' +
			'  }' +
			'' +
			'  td.success {' +
			'    background-color: green;' +
			'    color: white;' +
			'  }' +
			'' +
			'  td.failure {' +
			'    background-color: red;' +
			'    color: white;' +
			'  }';
		const css = document.createElement('style') as any;
		css.type = 'text/css';

		if (css.styleSheet) {
			css.styleSheet.cssText = styles;
		} else {
			css.appendChild(document.createTextNode(styles));
		}
		document.getElementsByTagName('head')[0].appendChild(css);
	}

	private logPending(test: string) {
		let tr = document.createElement('tr');
		tr.innerHTML = `<td>${test}</td><td>PENDING</td>`;
		this.infoTable.appendChild(tr);
	}

	private logResult(test: string, result: string, success: boolean) {
		let tr = document.createElement('tr');
		tr.innerHTML = `<td>${test}</td><td class="${success ? 'success' : 'failure'}">${result}</td>`;
		this.infoTable.lastChild.remove();
		this.infoTable.appendChild(tr);
	}
}