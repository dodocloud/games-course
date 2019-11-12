import * as ECSA from '../../../../libs/pixi-component';
import { Messages, Assets } from '../constants';
import PIXISound from 'pixi-sound';

export const soundComponent = () => new ECSA.GenericComponent('SoundComponent')
  .doOnMessage(Messages.PACDOT_EATEN, () => PIXISound.play(Assets.SND_PACDOT))
  .doOnMessage(Messages.PACMAN_KILLED, () => PIXISound.play(Assets.SND_DEATH))
  .doOnMessage(Messages.BONUS_TAKEN, () => PIXISound.play(Assets.SND_PELLET))
  .doOnMessage(Messages.SPIDER_KILLED, () => PIXISound.play(Assets.SND_RUSHKILL));

