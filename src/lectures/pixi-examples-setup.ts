import Reveal from '../../libs/revealjs/revealjs';

// a small workaround that will allow to pass a type as a parameter
type factories = { name: string, factory: (view: HTMLElement) => any; };

export const initPixiWatcher = (...factories: factories[]) => {
  let runningExamples = {};
  // transform the array of types into typename-type map
  let pixiExamples = {};
  factories.forEach(type => pixiExamples[type.name] = type.factory);

  let pixiExamplesWatcher = (evt: any) => {
    if (evt.currentSlide) {
      let canvases = evt.currentSlide.getElementsByTagName('canvas');
      for (let i = 0; i < canvases.length; i++) {
        let type = (canvases[i] as HTMLElement).dataset['example'];
        if (type && pixiExamples[type]) {
          runningExamples[type] = new pixiExamples[type](canvases[i]); // invoke constructor
        }
      }
    }
    if (evt.previousSlide) {
      let canvases = (evt.previousSlide as HTMLElement).getElementsByTagName('canvas');
      for (let i = 0; i < canvases.length; i++) {
        let type = (canvases[i] as HTMLElement).dataset['example'];
        if (type) {
          if(runningExamples[type]['destroy']) {
            runningExamples[type].destroy(false);
          } else if(runningExamples[type]['engine']) {
            runningExamples[type]['engine'].destroy(false);
          }
          delete runningExamples[type];
        }
      }
    }
  };

  Reveal.addEventListener('ready', pixiExamplesWatcher, false);
  Reveal.addEventListener('slidechanged', pixiExamplesWatcher, false);
};