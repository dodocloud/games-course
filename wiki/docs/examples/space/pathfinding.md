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

- algorithm:

```javascript
let f be a priority of a node
let g be a cost from the origin to the current node
let h be an estimated cost from the current node to the target
let n1 be the first node
let n2 be the target node
let F be a priority queue

1. create queue F
2. insert n1 into F
3. until F is empty
	a) let q be a node of the lowest priority f
	b) take q from F
	c) for each neighbour s of q
		if s = n2, finish
		
		let new_cost be q.g + estimation(s, q)
		if(new_cost >= s.g) goto c)
		
		s.g = q.g + estimation(s, q)
		s.h = estimation(s, n2)
		
		s.f = s.g + s.h
		
		if there is another node s in the queue F which is of a lower priority than s.f, goto c)
		
		put s into F, setting the priority to s.f
		goto c)
	end
	goto 3
```

<APHCanvas name={'Pathfinding'} algorithm={'ASTAR'} />


### A-Star octile manhattan

<APHCanvas name={'Pathfinding'} mapType={'OCTILE'} distanceMeasurement={'MANHATTAN'} />

### A-Star octile euclidean

<APHCanvas name={'Pathfinding'} mapType={'OCTILE'} distanceMeasurement={'EUCLIDEAN'} />


### A-Star with optimistic heuristics

<APHCanvas name={'Pathfinding'} mapType={'OCTILE'} heuristics={'VERY_OPTIMISTIC'} />


### A-Star with pessimistic heuristics

<APHCanvas name={'Pathfinding'} mapType={'OCTILE'} heuristics={'VERY_PESSIMISTIC'} />
