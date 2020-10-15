const describe = (desc: string, fn: Function) => {
	console.log(desc);
	fn();
};

const it = (msg: string, fn: Function) => describe(`  ${msg}`, fn);

const matchers = (exp: any) => ({
	toBe: (assertion: any) => {
		if (exp === assertion) {
			console.log('pass');
			return true;
		} else {
			console.log('fail');
			return false;
		}
	}
});

const expect = (exp: any) => matchers(exp);


export {
	describe,
	expect,
	it,
	matchers
};