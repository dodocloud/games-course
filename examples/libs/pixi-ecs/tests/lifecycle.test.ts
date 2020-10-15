import { Graphics, FuncComponent, Container } from '..';
import { addTest } from './test-collector';
import { WIDTH, HEIGHT } from './test-runner';
import { ComponentState } from '../engine/component';
import Builder from '../engine/builder';
import Message from '../engine/message';

addTest('Component lifecycle test', (scene, onFinish, tick) => {
	const container = new Container('container');
	const sequence = [];
	const sequenceStates: ComponentState[] = [];

	const cmp = new FuncComponent('')
		.setFixedFrequency(60)
		.doOnInit((cmp) => {
			sequence.push('init');
			sequenceStates.push(cmp.cmpState);
		}).doOnAttach((cmp) => {
			sequence.push('attach');
			sequenceStates.push(cmp.cmpState);
		}).doOnRemove((cmp) => {
			sequence.push('remove');
			sequenceStates.push(cmp.cmpState);
		}).doOnUpdate((cmp) => {
			sequence.push('update');
			sequenceStates.push(cmp.cmpState);
		}).doOnFixedUpdate((cmp) => {
			sequence.push('fixed');
			sequenceStates.push(cmp.cmpState);
		}).doOnDetach((cmp) => {
			sequence.push('detach');
			sequenceStates.push(cmp.cmpState);
		}).doOnFinish((cmp) => {
			sequence.push('finish');
			sequenceStates.push(cmp.cmpState);
		});

	container.addComponent(cmp);
	scene.stage.addChild(container);
	tick();
	cmp.finish();
	tick();
	container.addComponent(cmp);
	tick();
	container.detach();
	tick();
	scene.stage.addChild(container);
	tick();
	container.destroy();

	const expectedSequence = ['init', 'attach', 'update', 'fixed', 'finish', 'detach', 'remove', 'init', 'attach',
		'update', 'fixed', 'detach', 'attach', 'update', 'fixed', 'finish', 'detach', 'remove'];
	const expectedSequenceStates = [ComponentState.NEW, ComponentState.INITIALIZED, ComponentState.RUNNING, ComponentState.RUNNING, ComponentState.RUNNING,
	ComponentState.FINISHED, ComponentState.DETACHED, ComponentState.REMOVED, ComponentState.INITIALIZED, ComponentState.RUNNING, ComponentState.RUNNING,
	ComponentState.RUNNING, ComponentState.DETACHED, ComponentState.RUNNING, ComponentState.RUNNING, ComponentState.RUNNING, ComponentState.FINISHED, ComponentState.DETACHED];

	const sequenceEqual = expectedSequence.filter((val, index) => sequence[index] !== val).length === 0;
	const sequenceStateEqual = expectedSequenceStates.filter((val, index) => sequenceStates[index] !== val).length === 0;

	onFinish(sequenceEqual && sequenceStateEqual, 'Lifecycle mismatch: Expected sequence ' + expectedSequence.join(', ') + '; given: ' + sequence.join(', '));
});


addTest('ComponentUpdateTest', (scene, onFinish) => {
	let gfx = new Graphics('');
	gfx.beginFill(0x0000FF);
	gfx.drawRect(0, 0, 50, 50);
	gfx.pivot.set(25, 25);
	gfx.position.set(300, 300);
	gfx.endFill();
	scene.stage.pixiObj.addChild(gfx);
	gfx.scale.x = 0;
	gfx.addComponent(new FuncComponent('').doOnFixedUpdate(() => gfx.scale.x++).setFixedFrequency(1)); // 1 per second
	scene.callWithDelay(3500, () => {
		let success = Math.floor(gfx.scale.x) === 3;
		onFinish(success, 'Wrong value: ' + gfx.scale.x);
	});
});


addTest('FrequencyTest', (scene, onFinish) => {
	let gfx = new Graphics('');
	gfx.beginFill(0xFFF00);
	gfx.drawCircle(0, 0, 100);
	gfx.position.set(WIDTH / 2, HEIGHT / 2);
	gfx.endFill();
	scene.stage.pixiObj.addChild(gfx);
	gfx.addComponent(new FuncComponent('')
		.setFixedFrequency(0.5) // 1x in 2 seconds
		.doOnFixedUpdate(() => gfx.scale.x /= 2));
	scene.callWithDelay(2500, () => { // should run 1x
		if (Math.abs(gfx.scale.x - 0.5) <= 0.01) {
			onFinish(true);
		} else {
			onFinish(false, 'Expected 0.5, given ' + gfx.scale.x);
		}
	});
});

addTest('FrequencyTest2', (scene, onFinish) => {
	let gfx = new Graphics('');
	gfx.beginFill(0xFFFF00);
	gfx.drawCircle(0, 0, 100);
	gfx.position.set(WIDTH / 2, HEIGHT / 2);
	gfx.endFill();
	scene.stage.pixiObj.addChild(gfx);
	gfx.addComponent(new FuncComponent('')
		.setFixedFrequency(2) // 2x per second
		.doOnFixedUpdate(() => gfx.scale.x /= 2));
	scene.callWithDelay(1800, () => { // should run 3x: 500 1000 1500
		if (Math.abs(gfx.scale.x - 0.125) <= 0.01) {
			onFinish(true);
		} else {
			onFinish(false, 'Expected 0.125, given ' + gfx.scale.x);
		}
	});
});

addTest('FrequencyTest3', (scene, onFinish) => {
	let gfx = new Graphics('');
	gfx.beginFill(0xEFCD56);
	gfx.drawRect(0, 0, 200, 200);
	gfx.position.set(WIDTH / 2, HEIGHT / 2);
	gfx.endFill();
	scene.stage.pixiObj.addChild(gfx);
	gfx.addComponent(new FuncComponent('')
		.setFixedFrequency(2) // 2x per second
		.doOnFixedUpdate((cmp, delta) => {
			gfx.scale.x *= (delta / 1000);
		})); // delta should be 500
	scene.callWithDelay(2200, () => { // should run 4x: 500 1000 1500, 2000
		if (Math.abs(gfx.scale.x - 0.0625) <= 0.01) {
			onFinish(true);
		} else {
			onFinish(false, 'expected 0.0625, given ' + gfx.scale.x);
		}
	});
});


addTest('FinishWithoutRemovalTest', (scene, onFinish) => {

	let initToken = 0;
	let attachToken = 0;
	let finishToken = 0;
	let messageToken = 0;
	let updateToken = 0;
	let removeToken = 0;
	let detachToken = 0;

	let component = new FuncComponent('myComponent')
		.setFixedFrequency(1) // 1x per second
		.doOnInit(() => initToken++)
		.doOnAttach(() => attachToken++)
		.doOnMessage('MSG_TEST', () => messageToken++)
		.doOnDetach(() =>detachToken++)
		.doOnFinish(() => finishToken++)
		.doOnRemove(() => removeToken++)
		.doOnFixedUpdate(() => updateToken++);

	// add object
	let gfx = new Graphics('');
	gfx.beginFill(0xEF05EF);
	gfx.drawCircle(0, 0, 50);
	gfx.position.set(WIDTH / 2, HEIGHT / 2);
	gfx.endFill();
	scene.stage.addChild(gfx);

	gfx.addComponent(component); // init + attach

	scene.callWithDelay(1200, () => { // update
		// component should be able to accept messages but no updates
		scene.sendMessage(new Message('MSG_TEST')); // message++
		// finish but don't remove from scene
		component.finish();  // finish++, detach++, remove++
		// remove from the scene
		// shouldn't accept messages
		scene.sendMessage(new Message('MSG_TEST'));
		scene.callWithDelay(1000, () => {
			// re-add the component to the scene
			gfx.addComponent(component);  
			
			scene.callWithDelay(1000, () => { // init++ attach++
				gfx.detach(); // detach++

				// shouldn't accept messages
				scene.sendMessage(new Message('MSG_TEST'));
				scene.stage.addChild(gfx); // attach++ 
	
				let success = initToken === 2 && attachToken === 3 && messageToken === 1 && detachToken === 2 && finishToken === 1 && updateToken === 2 && removeToken == 1;
				if (success) {
					onFinish(true);
				} else {
					onFinish(false, 'Wrong token value: ' + initToken + ':' + attachToken + ':' + messageToken + ':' + detachToken + ':' + finishToken +':' + updateToken + ':' + removeToken);
				}
			});
		});
	});
});


addTest('RecycleTest', (scene, onFinish) => {
	let initToken = 0;
	let finishToken = 0;
	let updateToken = 0;

	// component that will be reused by another object when removed from the first one
	let recyclableComponent = new FuncComponent('recyclable')
		.setFixedFrequency(1) // 1x per second
		.doOnInit(() => initToken++)
		.doOnFinish(() => finishToken++)
		.doOnFixedUpdate(() => updateToken++);

	// add object 1
	let gfx = new Graphics('');
	gfx.beginFill(0xFFFF00);
	gfx.drawCircle(0, 0, 100);
	gfx.position.set(WIDTH / 2, HEIGHT / 2);
	gfx.endFill();
	scene.stage.pixiObj.addChild(gfx);

	// add object 2
	let gfx2 = new Graphics('');
	gfx2.beginFill(0x0000FF);
	gfx2.drawRect(0, 0, 50, 50);
	gfx2.pivot.set(25, 25);
	gfx2.position.set(WIDTH / 2, HEIGHT / 2);
	gfx2.endFill();
	scene.stage.pixiObj.addChild(gfx2);

	gfx.addComponent(recyclableComponent);

	scene.callWithDelay(1200, () => {
		gfx.removeComponent(gfx.findComponentByName('recyclable'));
		gfx2.addComponent(recyclableComponent);

		scene.callWithDelay(1200, () => {
			let success = initToken === 2 && finishToken === 1 && updateToken === 3;
			if (success) {
				onFinish(true);
			} else {
				onFinish(false, 'Wrong token value: ' + initToken + ':' + finishToken + ':' + updateToken);
			}
		});
	});
});


addTest('Child Component initialized', (scene, onFinish) => {
	const components = [new FuncComponent('A'), new FuncComponent('B'), new FuncComponent('C')];
	let builder = new Builder(scene);
	builder.withChild(
		new Builder(scene)
			.withComponent(components[0])
			.asContainer()
	).withChild(
		new Builder(scene)
			.withComponent(components[1])
			.asContainer()
	);
	builder.asContainer();
	builder.withComponent(components[2]);
	builder.withParent(scene.stage).build();


	const areRunning = components.filter(cmp => cmp.cmpState === ComponentState.RUNNING).length === 3;
	onFinish(areRunning, 'Components are not running');
});

addTest('Components removed upon scene clear', (scene, onFinish, tick) => {
	const components = [new FuncComponent('A'), new FuncComponent('B'), new FuncComponent('C')];
	let builder = new Builder(scene);
	builder.withChild(
		new Builder(scene)
			.withComponent(components[0])
			.asContainer()
	).withChild(
		new Builder(scene)
			.withComponent(components[1])
			.asContainer()
	);
	builder.asContainer();
	builder.withComponent(components[2]);
	builder.withParent(scene.stage).build();

	tick();
	scene.clearScene();

	const areRemoved = components.filter(cmp => cmp.cmpState === ComponentState.REMOVED).length === 3;
	onFinish(areRemoved, 'Components were not removed!');
});

addTest('Children destroyed with their grandparent', (scene, onFinish, tick) => {
	const components = [new FuncComponent('A'), new FuncComponent('B'), new FuncComponent('C')];
	let builder = new Builder(scene);
	builder.withChild(
		new Builder(scene)
			.withComponent(components[0])
			.asContainer()
	).withChild(
		new Builder(scene)
			.withComponent(components[1])
			.asContainer()
	);
	builder.asContainer();
	builder.withComponent(components[2]);
	const parent = builder.withParent(scene.stage).build();
	const child1 = parent.children[0] as Container;
	const child2 = parent.children[1] as Container;
	tick();
	scene.stage.destroyChildren();

	const areRemoved = components.filter(cmp => cmp.cmpState === ComponentState.REMOVED).length === 3;
	const areDestroyed = child1.parentGameObject == null && child2.parentGameObject == null && parent.parentGameObject == null;
	onFinish(areRemoved && areDestroyed, 'Components or objects were not removed!');
});

addTest('Children destroyed with their parent', (scene, onFinish, tick) => {
	const components = [new FuncComponent('A'), new FuncComponent('B'), new FuncComponent('C')];
	let builder = new Builder(scene);
	builder.withChild(
		new Builder(scene)
			.withComponent(components[0])
			.asContainer()
	).withChild(
		new Builder(scene)
			.withComponent(components[1])
			.asContainer()
	);
	builder.asContainer();
	builder.withComponent(components[2]);
	const parent = builder.withParent(scene.stage).build();
	const child1 = parent.children[0] as Container;
	const child2 = parent.children[1] as Container;
	tick();
	parent.destroyChildren();

	const areRemoved = components.filter(cmp => cmp.cmpState === ComponentState.REMOVED).length === 2;
	const areDestroyed = child1.parentGameObject == null && child2.parentGameObject == null;
	onFinish(areRemoved && areDestroyed, 'Components or objects were not removed!');
});

addTest('Components removed upon destroy', (scene, onFinish, tick) => {
	const components = [new FuncComponent('A')];
	let builder = new Builder(scene);
	builder.withChild(
		new Builder(scene)
			.withComponent(components[0])
			.asContainer()
	);
	builder.asContainer();
	const parent = builder.withParent(scene.stage).build();
	const child1 = parent.children[0] as Container;
	tick();
	child1.destroy();

	onFinish(components[0]._cmpState === ComponentState.REMOVED, 'Component was not removed!');
});

addTest('All components updated when adding a new one', (scene, onFinish, tick) => {
	const updates = [];
	const components = [new FuncComponent('A').doOnUpdate(() => updates.push('A')),
	new FuncComponent('B').doOnUpdate(() => updates.push('B')),
	new FuncComponent('C').doOnUpdate((cmp) => {  // insert a new component in the middle of the loop
		updates.push('C');
		cmp.owner.addComponentAndRun(new FuncComponent('F').doOnUpdate(() => updates.push('F')));
	}),
	new FuncComponent('D').doOnUpdate(() => updates.push('D')),
	new FuncComponent('E').doOnUpdate(() => updates.push('E'))];
	let builder = new Builder(scene);
	builder.asContainer().withComponents(components);
	builder.withParent(scene.stage).build();
	tick();

	const expectedSequence = ['A', 'B', 'C', 'D', 'E', 'F'];
	const sequenceEqual = updates.filter((val, index) => expectedSequence[index] !== val).length === 0;

	onFinish(sequenceEqual, 'Update order mismatch: Expected sequence ' + expectedSequence.join(', ') + '; given: ' + updates.join(', '));
});

addTest('All components updated when removing an old one', (scene, onFinish, tick) => {
	const updates = [];
	const components = [new FuncComponent('A').doOnUpdate(() => updates.push('A')),
	new FuncComponent('B').doOnUpdate(() => updates.push('B')),
	new FuncComponent('C').doOnUpdate((cmp) => {
		updates.push('C');
		cmp.finish();
	}),
	new FuncComponent('D').doOnUpdate(() => updates.push('D')),
	new FuncComponent('E').doOnUpdate(() => updates.push('E'))];
	let builder = new Builder(scene);
	builder.asContainer().withComponents(components);
	builder.withParent(scene.stage).build();
	tick();

	const expectedSequence = ['A', 'B', 'C', 'D', 'E'];
	const sequenceEqual = updates.filter((val, index) => expectedSequence[index] !== val).length === 0;

	onFinish(sequenceEqual, 'Update order mismatch: Expected sequence ' + expectedSequence.join(', ') + '; given: ' + updates.join(', '));
});