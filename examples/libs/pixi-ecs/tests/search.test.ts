import { Container } from '..';
import { addTest } from './test-collector';

addTest('TagSearchTest', (scene, onFinish) => {
	scene.clearScene({ tagsSearchEnabled: true });
	let obj = new Container();
	obj.addTag('A');
	obj.addTag('B');
	obj.addTag('C');
	scene.stage.pixiObj.addChild(obj);

	let obj2 = new Container();
	obj2.addTag('A');
	scene.stage.pixiObj.addChild(obj2);

	let obj3 = new Container();
	obj3.addTag('A');
	obj3.addTag('B');
	scene.stage.pixiObj.addChild(obj3);
	let success = scene.findObjectsByTag('A').length === 3 && scene.findObjectsByTag('B').length === 2 && scene.findObjectsByTag('C').length === 1;
	onFinish(success);
});

addTest('TagSearchTest2', (scene, onFinish) => {
	scene.clearScene({ tagsSearchEnabled: true });
	let obj = new Container();
	obj.addTag('A');
	obj.addTag('B');
	obj.addTag('C');
	scene.stage.pixiObj.addChild(obj);

	let obj2 = new Container();
	obj2.addTag('A');
	scene.stage.pixiObj.addChild(obj2);

	let obj3 = new Container();
	obj3.addTag('A');
	obj3.addTag('B');
	scene.stage.pixiObj.addChild(obj3);
	obj3.removeTag('A');
	obj3.removeTag('B');
	let success = scene.findObjectsByTag('A').length === 2 && scene.findObjectsByTag('B').length === 1 && scene.findObjectsByTag('C').length === 1;
	onFinish(success);
});

addTest('StateSearchTest', (scene, onFinish) => {
	scene.clearScene({ statesSearchEnabled: true });
	let obj = new Container();
	obj.stateId = 15;
	scene.stage.pixiObj.addChild(obj);

	let obj2 = new Container();
	obj2.stateId = 15;
	scene.stage.pixiObj.addChild(obj2);

	let obj3 = new Container();
	obj3.stateId = 10;
	scene.stage.pixiObj.addChild(obj3);
	let success = scene.findObjectsByState(15).length === 2 && scene.findObjectsByState(10).length === 1 && scene.findObjectsByState(5).length === 0;
	onFinish(success);
});

addTest('StateSearchTest2', (scene, onFinish) => {
	scene.clearScene({ statesSearchEnabled: true });
	let obj = new Container();
	obj.stateId = 15;
	scene.stage.pixiObj.addChild(obj);

	let obj2 = new Container();
	obj2.stateId = 15;
	scene.stage.pixiObj.addChild(obj2);
	obj.stateId = 200; // change the state
	let success = scene.findObjectsByState(15).length === 1 && scene.findObjectsByState(200).length === 1;
	onFinish(success);
});

addTest('FlagSearchTest', (scene, onFinish) => {
	scene.clearScene({ flagsSearchEnabled: true });
	let obj = new Container();
	obj.setFlag(12);
	scene.stage.pixiObj.addChild(obj);
	obj.setFlag(120);
	let obj2 = new Container();
	obj2.setFlag(12);
	scene.stage.pixiObj.addChild(obj2);
	obj.resetFlag(120);
	let success = scene.findObjectsByFlag(12).length === 2 && scene.findObjectsByFlag(120).length === 0;
	onFinish(success);
});
