---
title: Cargo Bots
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from '@site/src/css/docs.module.scss';
import APHCanvas from '@site/src/APHCanvas.tsx'

### Source 
- source: `examples/src/08-ai/bots`

<APHCanvas name={'Bots'} />

### Entities
- non-playable sandbox
- there are resources of petrol and iron
- the bots need to bring them to the warehouse
- if the warehouse contains enough cargo (30 iron and 10 petrol), the factory will build a new bot
- every source has got their own capacity - if the capacity is exhausted, its icon will turn black

<div className={styles.figure}>
  <img className={styles.fill} src={useBaseUrl('img/docs/bots/bots_desc.svg')} />
</div>

### States

<div className={styles.figure}>
  <img className={styles.fill} src={useBaseUrl('img/docs/bots/bots_states.svg')} />
</div>

### Component Model
- the whole model is stored in `model.ts`
- `GameModel` contains the map and global attributes
- `BotModel` is a model for each bot
- `CargoSourceModel` is a model for iron ores and petrol rigs
- `WarehouseModel` and `FactoryModel` are models for the buildings
- components attached to bots are responsible for movement and AI logic
- AI logic is implemented in `BotAI` component
- the bots use **pathfinding and steering behavior** for movement
- each state handler has their own method
  - `processIdleState`
  - `processGoingToLoadState`
  - `processGoingToUnloadState`
  - `processLoadingState`
  - `processUnloadingState`

<div className={styles.figure}>
  <img className={styles.fill} src={useBaseUrl('img/docs/bots/bots_components.svg')} />
</div>