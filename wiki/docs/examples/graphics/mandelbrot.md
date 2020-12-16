---
title: Mandelbrot Set
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from '@site/src/css/docs.module.scss';
import APHCanvas from '@site/src/APHCanvas.tsx'

### What is mandelbrot
- a fractal-like object made by this recurrent function: `z[n+1] <- z[n] + c`
- `c` is a complex number, `z` starts from 0
- we can map complex number to vectors quite easily, yet it's important to keep in mind that arithmetic operations have to be managed in the complex field
- color represents a number where the iteration at given point stopped
- [Wikipedia](https://en.wikipedia.org/wiki/Mandelbrot_set)

### Source 
- source: `examples/src/07-graphics/mandelbrot.ts`
- vertex shader: `assets/07-graphics/shaders/mandelbrot.vert`
- fragment shader: `assets/07-graphics/shaders/mandelbrot.frag`

<APHCanvas name={'Mandelbrot'} />

