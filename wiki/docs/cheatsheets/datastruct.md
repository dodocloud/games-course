---
title: Data Structures
---

import useBaseUrl from '@docusaurus/useBaseUrl';

- green lines for positive outcome of the decision elements
- red lines for negative outcome of the decision elements

<img src={useBaseUrl('img/docs/data_structures.svg')} />

### Complexity of maps
- HashMap
  - complexity of O(1) for insertion and lookup.
  - allows one null key and multiple null values.
  - does not maintain any order.
- TreeMap
  - has complexity of O(logN) for insertion and lookup.
  - does not allow null key but allow multiple null values.
  - maintains order. It stores keys in sorted and ascending order.
- LinkedHashMap
  - has complexity of O(1) for insertion and lookup.
  - allows one null key and multiple null values.
  - maintains order in which key-value pairs are inserted.
