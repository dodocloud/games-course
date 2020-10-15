import { FuncComponent } from '..';
import Builder from '../engine/builder';
import { addTest } from './test-collector';
import { WIDTH, HEIGHT } from './test-runner';

addTest('BuilderTest', (scene, onFinish) => {
	let builder = new Builder(scene);
	builder.withComponent(() => new FuncComponent('').doOnUpdate((cmp, delta) => cmp.owner.pixiObj.rotation += 0.0001 * delta * cmp.owner.id));
	builder.anchor(0.5, 0.5);

	let finishedComponents = 0;
	builder.withComponent(() => new FuncComponent('').setDuration(Math.random() * 3000).doOnFinish(() => {
		finishedComponents++;
		if (finishedComponents === 100) {
			// we have all
			scene.callWithDelay(0, () => onFinish(true));
		}
	}));

	for (let i = 0; i < 100; i++) {
		builder.globalPos(Math.random() * WIDTH, Math.random() * HEIGHT);
		builder.asText('Hello', new PIXI.TextStyle({
			fontSize: 35,
			fill: '#F00'
		})).withParent(scene.stage).buildAndKeepData();
	}
});

addTest('BuilderTest2', (scene, onFinish) => {
	let builder = new Builder(scene);
	builder.withChild(
		new Builder(scene)
			.localPos(100, 100)
			.withName('text')
			.asText('CHILD1', new PIXI.TextStyle({ fontSize: 35, fill: '#0F0' }))
	).withChild(
		new Builder(scene)
			.localPos(-100, -100)
			.withName('text')
			.asText('CHILD2', new PIXI.TextStyle({ fontSize: 35, fill: '#00F' }))
	);
	builder.withName('text').asText('PARENT', new PIXI.TextStyle({ fontSize: 80, fill: '#F00' }));
	builder.withComponent(() => new FuncComponent('').doOnUpdate((cmp, delta) => cmp.owner.pixiObj.rotation += 0.001 * delta));
	builder.anchor(0.5, 0.5);
	builder.localPos(WIDTH / 2, HEIGHT / 2).withParent(scene.stage).build();

	scene.callWithDelay(2000, () => {
		let objects = scene.findObjectsByName('text');
		if (objects.length === 3 && objects.filter(obj => obj.pixiObj.parent.name === 'text').length === 2) {
			onFinish(true);
		} else {
			onFinish(false);
		}
	});
});


addTest('Builder component init test', (scene, onFinish) => {
	const initOrder = [];
	let builder = new Builder(scene);
	builder.withChild(
		new Builder(scene)
			.withComponent(new FuncComponent('').doOnInit(() => initOrder.push('CHILD1')))
			.asContainer()
	).withChild(
		new Builder(scene)
			.withComponent(new FuncComponent('').doOnInit(() => initOrder.push('CHILD2')))
			.asContainer()
	);
	builder.asContainer();
	builder.withComponent(() => new FuncComponent('').doOnInit(() => initOrder.push('PARENT')));
	builder.withParent(scene.stage).build();

	scene.callWithDelay(500, () => {
		const expectedOrder = ['PARENT', 'CHILD1', 'CHILD2'];
		const orderEqual = expectedOrder.filter((val, index) => initOrder[index] !== val).length === 0;

		onFinish(orderEqual, 'Init order mismatch: Expected order ' + expectedOrder.join(', ') + '; given: ' + initOrder.join(', '));
	});
});
