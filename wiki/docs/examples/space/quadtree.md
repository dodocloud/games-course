---
title: Quad Tree
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from '@site/src/css/docs.module.scss';
import APHCanvas from '@site/src/APHCanvas.tsx'

- source: `examples/src/04-space/quadtree.ts`


### Sparse tree

```typescript
{
    objectNum: 20;
	maxObjectsInLeaf: 5;
	maxTreeLevels: 2;
}
```

<APHCanvas name={'QuadTree'} objectNum={20} maxObjectsInLeaf={5} maxTreeLevels={2} />

### Aggressive split

```typescript
{
    objectNum: 50;
	maxObjectsInLeaf: 2;
	maxTreeLevels: 4;
}
```

<APHCanvas name={'QuadTree'} objectNum={50} maxObjectsInLeaf={2} maxTreeLevels={4} />

### Dense tree

```typescript
{
    objectNum: 500;
	maxObjectsInLeaf: 20;
	maxTreeLevels: 4;
}
```

<APHCanvas name={'QuadTree'} objectNum={180} maxObjectsInLeaf={4} maxTreeLevels={8} />