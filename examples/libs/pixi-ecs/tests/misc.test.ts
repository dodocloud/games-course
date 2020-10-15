import { Container } from '..';
import { addTest } from './test-collector';

addTest('FlagTest', (scene, onFinish) => {
	let obj = new Container();

	obj.setFlag(1);
	obj.setFlag(10);
	obj.setFlag(20);
	obj.setFlag(32);
	obj.setFlag(45);
	obj.setFlag(70);
	obj.setFlag(90);
	obj.setFlag(128);
	obj.resetFlag(1);
	obj.invertFlag(2);
	let flags = [...obj._proxy.getAllFlags()];
	let allFlags = [2, 10, 20, 32, 45, 70, 90, 128];
	let success = flags.length === allFlags.length && flags.filter(flag => allFlags.findIndex(it => it === flag) === -1).length === 0;
	onFinish(success);
});
