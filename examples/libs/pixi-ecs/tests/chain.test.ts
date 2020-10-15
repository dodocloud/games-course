import { Graphics, FuncComponent, Message } from '..';
import ChainComponent from '../components/chain-component';
import { addTest } from './test-collector';


addTest('ChainComponentTest', (scene, onFinish) => {
	let gfx = new Graphics('');
	gfx.beginFill(0x00FF00);
	gfx.drawRect(0, 0, 200, 200);
	gfx.pivot.set(100, 100);
	gfx.position.set(300, 300);
	gfx.endFill();
	scene.stage.pixiObj.addChild(gfx);
	let tokens = 0;
	gfx.addComponent(new FuncComponent('').doOnMessage('TOKEN', () => tokens++));
	gfx.addComponent(new ChainComponent()
		.beginRepeat(2)
		.waitFor(() => new FuncComponent('').doOnUpdate((cmp, delta) => gfx.rotation += 0.1 * delta).setDuration(500))
		.waitFor(() => new FuncComponent('').doOnUpdate((cmp, delta) => gfx.rotation -= 0.1 * delta).setDuration(500))
		.addComponent(() => new FuncComponent('').doOnUpdate((cmp, delta) => gfx.rotation += 0.01 * delta).setDuration(1000).doOnFinish((cmp) => cmp.sendMessage('TOKEN')))
		.waitForMessage('TOKEN')
		.endRepeat()
		.call(() => {
			scene.callWithDelay(0, () => onFinish(tokens === 2));
		})
	);
});

addTest('ChainComponentTest2', (scene, onFinish) => {
	let tokens = 0;
	let whileTokens = 0;
	scene.addGlobalComponent(new ChainComponent()
		.beginIf(() => false)
		.call(() => tokens = -10)
		.else()
		.call(() => tokens++)
		.endIf()
		.beginIf(() => true)
		.call(() => tokens++)
		.else()
		.call(() => tokens = -10)
		.endIf()
		.beginWhile(() => whileTokens <= 10)
		.call(() => whileTokens++)
		.endWhile()
		.call(() => {
			scene.callWithDelay(0, () => onFinish(tokens === 2));
		})
	);
});

addTest('ChainComponentTest3', (scene, onFinish) => {
	scene.addGlobalComponent(new ChainComponent()
		.waitForMessage('TOKEN')
		.call(() => {
			scene.callWithDelay(0, () => onFinish(true));
		})
	);

	scene.callWithDelay(2000, () => {
		scene.sendMessage(new Message('TOKEN'));
	});
});

addTest('ChainComponentTest4', (scene, onFinish) => {
	let token = 0;

	let cmpGenerator = () => new FuncComponent('generic').doOnMessage('STOP', (cmp) => {
		token++;
		cmp.finish();
	});

	scene.addGlobalComponent(new ChainComponent()
		.waitFor([cmpGenerator(), cmpGenerator(), cmpGenerator()]) // add 3 components and wait when all of them finish
		.call(() => {
			let success = token === 3;
			scene.callWithDelay(0, () => onFinish(success, 'FAILURE, expected 3, got ' + token));
		})
	);

	scene.callWithDelay(500, () => {
		scene.sendMessage(new Message('STOP'));
	});
});

addTest('ChainComponentConditionalTest', (scene, onFinish) => {
	scene.stage.setFlag(12);
	scene.stage.stateId = 22;
	scene.addGlobalComponent(new ChainComponent()
		.waitForMessageConditional('TOKEN', { ownerState: 22, ownerFlag: 12 })
		.call(() => {
			scene.callWithDelay(0, () => onFinish(true));
		})
	);

	scene.callWithDelay(200, () => {
		scene.stage.addComponent(new ChainComponent().call((cmp) => cmp.sendMessage('TOKEN')));
	});
});

addTest('Chain Merge', (scene, onFinish) => {
	let token = 0;
	const chain1 = new ChainComponent()
		.call(() => token++) // 1
		.call(() => token *= 2) // 2
		.call(() => token *= 3); // 6

	const chain2 = new ChainComponent()
		.call(() => token++) // 7
		.call(() => token++) // 8
		.call(() => token /= 2); // 4

	scene.addGlobalComponentAndRun(chain1.mergeWith(chain2));

	onFinish(token === 4, `Wrong token value, expected 4, found ${token}`);
});

addTest('Chain Merge at the beginning', (scene, onFinish) => {
	let token = 0;

	const chain2 = new ChainComponent()
		.call(() => token++) // 1
		.call(() => token++) // 2
		.call(() => token /= 2); // 1


	const chain1 = new ChainComponent()
		.call(() => token++) // 2
		.call(() => token *= 2) // 4
		.call(() => token *= 3); // 12

	scene.addGlobalComponentAndRun(chain1.mergeAtBeginning(chain2));

	onFinish(token === 12, `Wrong token value, expected 12, found ${token}`);
});

addTest('Chain Wait for all', (scene, onFinish) => {
	let token = 0;

	const chain = new ChainComponent()
		.waitFor([
			new FuncComponent('A').doOnUpdate((cmp) => {
				token++;
				cmp.finish();
			}),
			new FuncComponent('B').doOnUpdate((cmp) => {
				token++;
				cmp.finish();
			})]);

	scene.addGlobalComponentAndRun(chain);
	scene.callWithDelay(100, () => {
		onFinish(token === 2, `Wrong token value, expected 2, found ${token}`);
	});
});

addTest('Chain Wait for first', (scene, onFinish) => {
	let token = 0;

	const chain = new ChainComponent()
		.waitForFirst([
			new FuncComponent('A').doOnUpdate((cmp) => {
				token++;
				cmp.finish();
			}),
			new FuncComponent('B').doOnUpdate((cmp) => {
				token++;
				cmp.finish();
			}),
			new FuncComponent('C').doOnUpdate(() => {
				token++; // endless
			})]);

	scene.addGlobalComponentAndRun(chain);
	scene.callWithDelay(100, () => {
		onFinish(token === 3, `Wrong token value, expected 3, found ${token}`);
	});
});