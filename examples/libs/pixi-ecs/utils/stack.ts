

type StackNode = {
    next;
    previous;
}

/**
 * Simple stack for chain-of-commands pattern
 */
export default class Stack<T extends StackNode> {
	protected topNode: T = null;
	protected size = 0;

	constructor() {
		this.topNode = null;
		this.size = 0;
	}

	/**
	 * Pushes a new node onto the stack
	 */
	push(node: T) {
		this.topNode = node;
		this.size += 1;
	}

	/**
	 * Pops the current node from the stack
	 */
	pop(): T {
		let temp = this.topNode;
		this.topNode = this.topNode.previous;
		this.size -= 1;
		return temp;
	}

	/**
	 * Returns the node on the top
	 */
	top(): T {
		return this.topNode;
	}
}