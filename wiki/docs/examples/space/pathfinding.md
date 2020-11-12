---
title: Pathfinding
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from '@site/src/css/docs.module.scss';
import APHCanvas from '@site/src/APHCanvas.tsx'

- **click to interact**
- source: `examples/src/04-space/pathfinding.ts`

### Breadth-first search

<APHCanvas name={'Pathfinding'} algorithm={'BREADTH_FIRST'} />

### Dijkstra

<APHCanvas name={'Pathfinding'} algorithm={'DIJKSTRA'} />

### A-Star

<APHCanvas name={'Pathfinding'} algorithm={'ASTAR'} />


### A-Star octile manhattan

<APHCanvas name={'Pathfinding'} mapType={'OCTILE'} distanceMeasurement={'MANHATTAN'} />

### A-Star octile euclidean

<APHCanvas name={'Pathfinding'} mapType={'OCTILE'} distanceMeasurement={'EUCLIDEAN'} />


### A-Star with optimistic heuristics

<APHCanvas name={'Pathfinding'} mapType={'OCTILE'} heuristics={'VERY_OPTIMISTIC'} />


### A-Star with pessimistic heuristics

<APHCanvas name={'Pathfinding'} mapType={'OCTILE'} heuristics={'VERY_PESSIMISTIC'} />
