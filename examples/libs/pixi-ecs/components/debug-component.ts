import Component from '../engine/component';
import { Messages } from '../engine/constants';
import Container from '../engine/game-objects/container';
import Message from '../engine/message';
import { Keys } from './key-input-component';

/**
 * Debugging component that display a scene graph
 */
export default class DebugComponent extends Component<void> {

	// messages that will be ignored
	discaredMessages: string[] = [
		Messages.COMPONENT_ADDED, 
		Messages.COMPONENT_REMOVED, 
		Messages.OBJECT_ADDED,
		Messages.OBJECT_REMOVED, 
		Messages.STATE_CHANGED,
		Messages.ATTRIBUTE_CHANGED, 
		Messages.ATTRIBUTE_REMOVED
	];
	
	// if true, will also render properties
	displayProps = true;

	protected debugElement: HTMLElement = null;
	protected msgElement: HTMLElement = null;


	onInit() {
		this.initDebugWindow();
		// subscribe to all messages
		this.subscribe(Messages.ANY);
	}

	onMessage(msg: Message) {

		// discared messages from the log
		if (this.discaredMessages.indexOf(msg.action as any) === -1) {
			let row = document.createElement('tr');
			let cell1 = document.createElement('td');
			let cell2 = document.createElement('td');
			let cell3 = document.createElement('td');
			let cell4 = document.createElement('td');
			cell1.style.color = '#CDCDCD';
			cell2.style.color = '#ff7e7e';
			cell3.style.color = '#7e8bff';
			cell4.style.color = '#7eff80';
			cell1.innerText = (this.scene.currentAbsolute / 1000).toFixed(2);
			cell2.innerText = msg.action;
			cell3.innerText = msg.component ? msg.component.name : 'n/a';
			cell4.innerText = msg.gameObject ? msg.gameObject.name : 'n/a';
			row.appendChild(cell1);
			row.appendChild(cell2);
			row.appendChild(cell3);
			row.appendChild(cell4);
			this.msgElement.insertBefore(row, this.msgElement.childNodes[0]);
			this.msgElement.scrollTo(0, 0);
		}

		if (msg.action === Messages.OBJECT_ADDED) {
			this.addGameObject(msg.gameObject);
		} else if (msg.action === Messages.COMPONENT_ADDED) {
			this.addComponent(msg.component, msg.gameObject);
		} else if (msg.action === Messages.COMPONENT_REMOVED) {
			this.removeComponent(msg.component);
		} else if (msg.action === Messages.OBJECT_REMOVED) {
			const container = document.getElementById(this.getObjectId(msg.gameObject));
			if (container) {
				container.remove();
			}
		} else if (msg.action === Messages.SCENE_CLEAR) {
			// remove left panel
			this.debugElement.innerHTML = '';
		}
	}

	protected addGameObject(obj: Container) {
		let id = this.getObjectId(obj);
		let item = document.getElementById(id);
		if (item) {
			return;
		}

		if (obj.pixiObj.parent !== null) {
			// add under the parent
			let list = document.createElement('ul');
			item = document.createElement('li');
			list.appendChild(item);
			item.id = this.getObjectId(obj);
			let parent = document.getElementById(this.getObjectId(<Container><any>obj.pixiObj.parent));
			if (parent == null) {
				// parent hasn't been created yet -> create it accordingly
				this.addGameObject(obj.parentGameObject);
				parent = document.getElementById(this.getObjectId(<Container><any>obj.pixiObj.parent));
			}
			parent.appendChild(list);
		} else {
			item = document.createElement('li');
			item.id = this.getObjectId(obj);
			this.debugElement.childNodes[0].appendChild(item);
		}


		let content = document.createElement('span');
		content.style.color = '#ff7e7e';
		content.innerText = obj.id + ':' + obj.name;
		item.appendChild(content);

		for (let key of ['components']) {
			let ul = document.createElement('ul');
			ul.id = this.getObjectId(obj) + '_' + key;
			item.appendChild(ul);
		}

		for (let [, cmp] of obj._proxy.rawComponents) {
			this.addComponent(cmp, obj);
		}
	}

	protected removeGameObject(obj: Container) {
		const elem = document.getElementById(this.getObjectId(obj));
		const parent = elem.parentElement;
		elem.remove();
		if (parent.childElementCount === 0) {
			parent.remove();
		}
	}

	protected addComponent(cmp: Component<any>, obj: Container) {
		if (document.getElementById(this.getObjectId(obj)) === null) {
			this.addGameObject(obj);
		}
		if (document.getElementById(this.getComponentId(cmp)) !== null) {
			// don't add it twice
			return;
		}
		let cmpSection = document.getElementById(this.getComponentSectionId(obj));
		let cmpList = document.createElement('li');
		let compNode = document.createElement('span');
		compNode.style.color = '#7e8bff';
		cmpList.id = this.getComponentId(cmp);
		cmpSection.appendChild(cmpList);
		cmpList.appendChild(compNode);
		compNode.innerText = cmp.id + ':' + cmp.name;
		if (cmp.props && this.displayProps) {
			try {
				const propsStr = JSON.stringify(cmp.props);
				let propsList = document.createElement('ul');
				let propsItem = document.createElement('li');
				let propsNode = document.createElement('span');
				propsNode.style.color = '#7eff80';
				propsNode.innerHTML = propsStr;
				cmpList.appendChild(propsList);
				propsList.appendChild(propsItem);
				propsItem.appendChild(propsNode);
			} catch (err) {
				// cyclic item value err
			}
		}
	}

	protected removeComponent(cmp: Component<any>) {
		const container = document.getElementById(this.getComponentId(cmp));
		if (container) {
			container.remove();
		}
	}

	protected getObjectId(obj: Container) {
		return `node_${obj.id}`;
	}

	protected getObjectInfoSectionId(obj: Container) {
		return 'node_' + obj.id + '_info';
	}

	protected getComponentSectionId(obj: Container) {
		return 'node_' + obj.id + '_components';
	}

	protected getComponentId(cmp: Component<any>) {
		return 'cmp_' + cmp.id;
	}


	private initDebugWindow() {
		let debugContainer = document.getElementById('debugContainer');
		if (!debugContainer) {
			debugContainer = document.createElement('div');
			debugContainer.id = 'debugContainer';
			debugContainer.style.width = '800px';
			debugContainer.style.display = 'inline';
			document.getElementsByTagName('body')[0].appendChild(debugContainer);
		}

		// prevent key down as we don't want to scroll while playing the game
		document.onkeydown = (evt) => {
			if ([Keys.KEY_LEFT, Keys.KEY_RIGHT, Keys.KEY_UP, Keys.KEY_DOWN].indexOf(evt.keyCode) !== -1) {
				evt.preventDefault();
			}
		};
		let debugElem = document.getElementById('debug');
		if (!debugElem) {
			debugElem = document.createElement('div');
			debugElem.id = 'debug';
			debugElem.style.width = '400px';
			debugElem.style.height = '100vh';
			debugElem.style.overflow = 'scroll';
			debugElem.style.cssFloat = 'left';
			debugElem.style.backgroundColor = '#000';
			debugElem.style.fontFamily = '\'Courier New\', monospace';
			debugElem.style.fontSize = '15px';
			debugContainer.appendChild(debugElem);
		}
		debugElem.innerHTML = '';
		let list = document.createElement('ul');
		debugElem.appendChild(list);

		let messageElem = document.getElementById('debug_msg');

		if (!messageElem) {
			messageElem = document.createElement('div');
			messageElem.id = 'debug_msg';
			messageElem.style.width = '400px';
			messageElem.style.height = '100vh';
			messageElem.style.overflow = 'scroll';
			messageElem.style.cssFloat = 'left';
			messageElem.style.backgroundColor = '#000';
			messageElem.style.fontFamily = '\'Courier New\', monospace';
			messageElem.style.fontSize = '15px';
			let table = document.createElement('table');
			messageElem.appendChild(table);
			debugContainer.appendChild(messageElem);
		}
		this.debugElement = debugElem;
		this.msgElement = messageElem.children[0] as HTMLElement;
	}
}