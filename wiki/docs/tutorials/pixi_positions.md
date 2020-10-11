---
title: PixiJS Positioning
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from '@site/src/css/docs.module.scss';

### Attributes
- position, rotation, scale, pivot, anchor
- `rotation` - Z-rotation in radians
- `pivot` - origin of the object in px
  - rotation is always measured around the origin
  - scale doesn't affect the pivot
- `anchor` - relative origin of the object (only for Sprites)
- `stage` - root element of the scene graph
- `getBounds()` - retrieves the bounds of an object, can be used to check where the object is
- `toGlobal()` - calculates the global position
- `toLocal()` - calculates the local position relative to another point

:::note

the scale of the parent affects the units of its children

:::


### Examples

- **positioning of a single element**

<div className={styles.figure}>
  <img className={styles.fill} src={useBaseUrl('img/docs/tutorials/02-pixi/pos_single_1.svg')} />
</div>

___
- **rotation is around the origin/pivot, which is by default in the top-left corner**

<div className={styles.figure}>
  <img className={styles.fill} src={useBaseUrl('img/docs/tutorials/02-pixi/pos_single_rot_1.svg')} />
</div>

___
- **pivot also affects the offset of the location of the object**

<div className={styles.figure}>
  <img className={styles.fill} src={useBaseUrl('img/docs/tutorials/02-pixi/pos_single_2.svg')} />
</div>

___
- **having the pivot in the center, we can rotate the object around its center**

<div className={styles.figure}>
  <img className={styles.fill} src={useBaseUrl('img/docs/tutorials/02-pixi/pos_single_rot_2.svg')} />
</div>

___
- **the scale of parent objects affects the units of their children**

<div className={styles.figure}>
  <img className={styles.fill} src={useBaseUrl('img/docs/tutorials/02-pixi/pos_multi_1.svg')} />
</div>

___
- **same values, yet the squares are independent**

<div className={styles.figure}>
  <img className={styles.fill} src={useBaseUrl('img/docs/tutorials/02-pixi/pos_multi_2.svg')} />
</div>

___
- **the green and the blue square are children of the red square**

<div className={styles.figure}>
  <img className={styles.fill} src={useBaseUrl('img/docs/tutorials/02-pixi/pos_multi_3.svg')} />
</div>