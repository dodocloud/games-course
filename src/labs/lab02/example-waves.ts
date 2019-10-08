class Waveforms {
  context: AudioContext;
  oscillator: OscillatorNode;
  gainNode: GainNode;

  constructor(context: AudioContext) {
      this.context = context;
  }

  init() {
      this.oscillator = this.context.createOscillator();
      this.gainNode = this.context.createGain();
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.context.destination);
  }

  play() {
      this.init();
      this.gainNode.gain.setValueAtTime(0.5, this.context.currentTime);
      this.oscillator.start();
  }

  stop() {
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 1);
      this.oscillator.stop(this.context.currentTime + 1);
  }

}

let initWaveforms = () => {
  let audioCtx = new ((<any>window).AudioContext || (<any>window).webkitAudioContext)();
  let sound = new Waveforms(audioCtx);
  sound.init();

  let wave = 'sine';

  let buttons: NodeListOf<HTMLHRElement> = document.querySelectorAll('.waveform');
  let playBtn: HTMLHRElement = document.querySelector('#play');
  let container: HTMLDivElement = document.querySelector('.waveforms-container');

  let cleanClass = (rclass) => {
    buttons.forEach((button) => {
        button.classList.remove(rclass);
    });
  };

  buttons.forEach((button) => {
      button.addEventListener('click', () => {
          cleanClass('active');
          wave = button.dataset.wave;
          sound.oscillator.type = wave as OscillatorType;
          button.classList.add('active');
      });
  });

  playBtn.addEventListener('click', () => {
      container.classList.toggle('playing'); // run the animation

      if (playBtn.textContent === 'Play') {
          sound.play();
          sound.oscillator.type = wave as OscillatorType;
          playBtn.textContent = 'Pause';
      } else {
          sound.stop();
          playBtn.textContent = 'Play';
      }
  });
};

initWaveforms();