---
title: Random distribution
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from '@site/src/css/docs.module.scss';
import APHCanvas from '@site/src/APHCanvas.tsx'

- source: `examples/src/04-space/distribution.ts`
- Normal distribution is generated from the uniform distribution by using `Box-Muller Transform`
  - algorithm: `libs/aph-math/procedural/random.ts`

### Normal distribution

<APHCanvas name={'DistributionNormal'} width={400} height={300} />

### Uniform distribution

<APHCanvas name={'DistributionUniform'} width={400} height={300} />
