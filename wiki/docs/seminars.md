---
title: Introduction

---

## Materials

- upon every commit, the content gets deployed to a live environment in [aph.dodo.me](https://aph.dodo.me/)
- tutorial explaining how to make this project work can be found in [environment](./environment.md)
- requirements to finish this course can be found in [requirements](./requirements.md)
- evaluation of the classes will be located on [grades.fit.cvut.cz](https://grades.fit.cvut.cz/)

### Code examples
- examples will be written in **TypeScript**
- if you build the examples in this project (by running `npm run dev-examples`), you will find all examples listed in `localhost:1234/index.html`

#### PixiJS
- HTML5 creation 2D library
- lightweight 2D JavaScript library
- supports both CanvasAPI and WebGL
- [main page](https://www.pixijs.com/)
- [github](https://github.com/pixijs/pixi.js/)
- [documentation](http://pixijs.download/dev/docs/index.html)
- [examples](https://pixijs.io/examples/#/demos-basic/container.js/)
  

#### ThreeJS
- HTML5 creation 3D library
- will be used for 3D examples
- [main page](https://threejs.org/)
- [github](https://github.com/mrdoob/three.js/)
- [documentation](https://threejs.org/docs/index.html)
- [examples](https://threejs.org/examples/#webgl_animation_cloth/)


### Presentation
- slides are written in HTML, powered by [**RevealJS**](https://revealjs.com/) library
- if you build the slides in this project (by running `npm run dev-slides`), you will, find all slides listed in `localhost:1234/index.html`

Keyboard shortcuts for the slides:

| Key | Action | 
| ------ | ------ | 
| N, SPACE | Next slide | 
| P | Previous slide |
| ← , H | Navigate left |
| → , L | Navigate right |
| ↑ , K | Navigate up |
| ↓ , J | Navigate down |
| Home , ⌘/CTRL ← | First slide |
| End , ⌘/CTRL → | Last slide |
| F | Fullscreen |
| ESC, O | Slide overview |
| CTRL + Shift + F | Search |

#### Browser support
- RevealJS used as a presentation framework supports all browsers since 2012 (Chrome 24+, Firefox 4+, IE10+, Edge, Safari, Opera)
- custom styles were tested against Chrome 77 and Firefox 69 (Windows, Linux and Android platforms)
- if you bump into anything that appears wrongly aligned, or worse, broken, feel free to notify the lecturer

### PDF Export
- yes, it is supported 🙌
- you should use `Google Chrome` since it has got a built-in PDF export and the slides were optimized for it
- go to the main page, select a lecture down below and click on the print icon label
  - alternatively, navigate to a presentation you want to export either on your localhost or on the live environment and put `?print-pdf` as a query string (e.g. `localhost:1234/lecture01.html?print-pdf`)
- in this mode, you will see all slides aligned vertically, stripped out of all visual effects and glowing backgrounds
- press right mouse button, select `print`
- select `Save as PDF` as the Destination
- wait for the preview to be generated and click on `Save`

## Lectures

| Week | Date | Topic | Link |
| ------ | ------ | ------ | ------ |
| 1 | 24.9. | Games | [Link 1](https://aph.dodo.me/slides/organization.html#/) [Link 2](https://aph.dodo.me/slides/lecture01.html#/)  |
| 2 | 1.10. | Engines | [Link](https://aph.dodo.me/slides/lecture02.html/) |
| 3 | 8.10. | Assets |  [Link](https://aph.dodo.me/slides/lecture03.html/) |
| 4 | 15.10. | Components |  [Link](https://aph.dodo.me/slides/lecture04.html/) |
| 5 | 22.10. | Patterns | [Link](https://aph.dodo.me/slides/lecture05.html/) |
| 6 | 29.10. | Audio | [Link](https://aph.dodo.me/slides/lecture06.html/) |
| 7 | 5.11. | Space | |
| 8 | 12.11. | Physics | |
| 9 | 19.11. | ------ | |
| 10 | 26.11. | Graphics | |
| 11 | 3.12. | AI | |
| 12 | 10.12. | Multiplayer | |
| 13 | 17.12. | Design |  |


## Labs
- labs will be pre-recorded and uploaded to MS Teams
- every week will be dedicated to consultations, taking place after the lecture

| Week | Upload Date | Topic |
| ------ | ------ | ------ |
| 1 | 24.9. | Introduction |
| 2 | 1.10. | PixiJS |
| 3 | 8.10. | ThreeJS |
| 4 | 15.10. | Components |
| 7 | 5.11. | Patterns, Algorithms |
| 8 | 12.11. | Physics |
| 10 | 26.11. | Graphics | 
| 11 | 3.12. | Game AI  | 
| 12 | 10.12. | Multiplayer |
