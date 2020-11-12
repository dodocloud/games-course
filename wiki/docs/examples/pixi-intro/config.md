---
title: Config
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from '@site/src/css/docs.module.scss';
import APHCanvas from '@site/src/APHCanvas.tsx'

- source: `examples/src/01-helloworld/pixi.ts`


### Transparent canvas

```typescript
{
    transparent: true,
    antialias: true,
}
```

<APHCanvas name={'PixiHelloWorld'} transparent={true} antialias={true} resolution={1} />

### Antialiasing off

```typescript
{
    transparent: false,
    backgroundColor: 0x000000
    antialias: false,
}
```

<APHCanvas name={'PixiHelloWorld'} backgroundColor={0x000000} antialias={false}  />

### White background

```typescript
{
    transparent: false,
    backgroundColor: 0xffffff
    antialias: true,
}
```

<APHCanvas name={'PixiHelloWorld'} backgroundColor={0xFFFFFF} antialias={true} />