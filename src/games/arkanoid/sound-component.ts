import * as ECSA from '../../../libs/pixi-component';
import { Messages, Assets } from './constants';
import PIXISound from 'pixi-sound';

export const soundComponent = () => new ECSA.GenericComponent('SoundComponent')
.doOnMessage(Messages.ROUND_STARTED, (cmp, msg) => PIXISound.play(Assets.SND_ROUND))
.doOnMessage(Messages.OBJECT_HIT, (cmp, msg) => PIXISound.play(Assets.SND_HIT))
.doOnMessage(Messages.GAME_OVER, (cmp, msg) => PIXISound.play(Assets.SND_GAMEOVER))
.doOnMessage(Messages.LEVEL_COMPLETED, (cmp, msg) => PIXISound.play(Assets.SND_GAMEOVER))
.doOnMessage(Messages.LEVEL_STARTED, (cmp, msg) => PIXISound.play(Assets.SND_ROUND))
.doOnMessage(Messages.GAME_STARTED, (cmp, msg) => PIXISound.play(Assets.SND_INTRO))
.doOnMessage(Messages.GAME_COMPLETED, (cmp, msg) => PIXISound.play(Assets.SND_GAMEOVER));
