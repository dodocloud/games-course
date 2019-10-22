import * as ECSA from '../../../libs/pixi-component';
import { Messages, Assets } from './constants';
import PIXISound from 'pixi-sound';

export const soundComponent = () => new ECSA.GenericComponent('SoundComponent')
.doOnMessage(Messages.PROJECTILE_FIRED, (cmp, msg) => PIXISound.play(Assets.SND_FIRE))
.doOnMessage(Messages.GAME_OVER, (cmp, msg) => PIXISound.play(Assets.SND_GAMEOVER))
.doOnMessage(Messages.UNIT_KILLED, (cmp, msg) => PIXISound.play(Assets.SND_KILL));