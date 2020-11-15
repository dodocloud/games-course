---
title: Rotation
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from '@site/src/css/docs.module.scss';
import APHCanvas from '@site/src/APHCanvas.tsx'

- source: `examples/src/05-dynamics/rotation.ts`
  - <span className={styles["color-tomato-light"]}>red color:</span> implicit Euler, decreasing energy
  - <span className={styles["color-lemon"]}>yelow color</span>: explicit Euler
  - <span className={styles["color-royal"]}>blue color</span>: improved Euler, increasing energy

### Frequency 60 FPS

<APHCanvas name={'Rotation'} frequency={60} />

### Frequency 20 FPS

<APHCanvas name={'Rotation'} frequency={20} />

### Frequency 10 FPS

<APHCanvas name={'Rotation'} frequency={10} />

### Frequency 2 FPS

<APHCanvas name={'Rotation'} frequency={2} />