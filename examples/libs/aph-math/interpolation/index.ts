export const linear: any = (current: number, start: number, length: number) => Math.min(1, Math.max(0, (current - start) / length));

export const easeinout = (current: number, start: number, length: number) => {
	let pos = linear(current, start, length);
	let posInt = pos < 0.5 ? 2 * pos * pos : -1 + (4 - 2 * pos) * pos;
	return Math.min(1, Math.max(0, posInt));
}

export const quadraticEaseIn = (current: number, start: number, length: number) => {
	let pos = linear(current, start, length);
	let posInt = pos * pos;
	return Math.min(1, Math.max(0, posInt));
}

export const quadraticEaseOut = (current: number, start: number, length: number) => {
	let pos = linear(current, start, length);
	let posInt = 1 - (1 - pos) * (1 - pos);
	return Math.min(1, Math.max(0, posInt));
}

export const quadraticEaseInOut = (current: number, start: number, length: number) => {
	let pos = linear(current, start, length);
	return pos < 0.5 ? (quadraticEaseIn(pos * 2, 0, 1) * 0.5) : (1 - quadraticEaseIn(2 - pos * 2, 0, 1) * 0.5);
}

export const sineIn = (current: number, start: number, length: number) => {
	let pos = linear(current, start, length);
	let posInt = Math.sin(pos * Math.PI / 2);
	return Math.min(1, Math.max(0, posInt));
}

export const sineOut = (current: number, start: number, length: number) => {
	let pos = linear(current, start, length);
	let posInt = Math.sin((1 - pos) * Math.PI / 2);
	return Math.min(1, Math.max(0, posInt));
}

export const expoIn = (current: number, start: number, length: number) => {
	let pos = linear(current, start, length);
	let posInt = Math.pow(2, 10 * (pos - 1));
	return Math.min(1, Math.max(0, posInt));
}