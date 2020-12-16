export const SCENE_WIDTH = 16;

export const TEXTURE_SCALE = SCENE_WIDTH / (100 * 16);

export enum Messages {
	BALL_ATTACH = 'BALL_ATTACH',
	BALL_RELEASE = 'BALL_RELEASE',
	BALL_COLLIDED = 'BALL_COLLIDED'
}

export enum BallStates {
	ATTACHED = 1,
	RELEASED = 2
}

export enum Tags {
	BRICK = 'brick',
	BALL = 'ball',
	PADDLE = 'paddle'
}

export enum Attrs {
	VELOCITY = 'velocity',
	SCENE_HEIGHT = 'scene_height'
}

export enum Assets {
	SPRITESHEET = 'spritesheet',
	LEVELS = 'levels'
}