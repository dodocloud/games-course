
/**
 * A generic node for chain of commands
 * Stores two parameters
 */
export default class CmdNode {
	key = 0;
	// custom parameters
	param1: any = null;
	param2: any = null;
	// cached custom parameters
	param1C: any = null;
	param2C: any = null;
    // if true, params are already cached
    cached: boolean = false;
	// link to previous and next node
	next: CmdNode = null;
	previous: CmdNode = null;

	constructor(key: number, param1: any = null, param2: any = null) {
		this.key = key;
		this.param1 = param1;
		this.param2 = param2;

		this.param1C = null;
		this.param2C = null;
	}

	/**
	 * Caches params or their results (if a corresponding parameter is a function) into param<num>Cached variables
	 */
	cacheParams() {
		if (!this.cached) {
			if (this.param1 != null) {
                // if the param is a function (we expect a factory pattern), store the result of the function
                this.param1C = typeof (this.param1) === 'function' ? this.param1() : this.param1;
			}

			if (this.param2 != null) {
				this.param2C = typeof (this.param2) === 'function' ? this.param2() : this.param2;
			}

			this.cached = true;
		}
	}

	getParam1() {
		if (!this.cached) {
			this.cacheParams();
		}
		return this.param1C;
	}

	setParam1(val: any) {
        this.param1 = val;
		this.param1C = val;
	}

	getParam2() {
		if (!this.cached) {
			this.cacheParams();
		}
		return this.param2C;
	}

	setParam2(val: any) {
        this.param2 = val;
		this.param2C = val;
	}

	resetCache() {
		this.param1C = this.param2C = null;
		this.cached = false;
	}
}