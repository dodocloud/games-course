export enum Attributes {
	DYNAMICS = 'DYNAMICS',
	GAME_MODEL = 'GAME_MODEL',
	FACTORY = 'FACTORY',
	BOT_MODEL = 'BOT_MODEL'
}

export enum BotStates {
	IDLE = 0,
	GOING_TO_LOAD = 1,
	GOING_TO_UNLOAD = 2,
	LOADING = 3,
	UNLOADING = 4
}

export enum BotTypes {
	RED = 1,
	BLUE = 2
}

export enum CargoTypes {
	NONE = 0,
	ORE = 1,
	PETROL = 2
}

export enum Assets {
	TEXTURE = 'TEXTURE'
}

export enum MapBlocks {
	PATH = 0,
	WALL = 1,
	WAREHOUSE = 2,
	ORE = 3,
	PETROL = 4,
	FACTORY = 5
}

export const MAP_BLOCK_SIZE = 128;

