import { initPixiWatcher } from '../../lectures/pixi-examples-setup';
import { ExampleRayCasting } from './example-raycaster';
import { ExamplePerlinNoise } from './example-perlin-noise';
import { ExampleVisibilityCone } from './example-viscone';
import { ExamplePathfinding, MapType, Heuristics, PathAlgorithm, DistanceMeasurement } from './example-pathfinding';

// will be referred via <canvas data-example>
initPixiWatcher(
  { name: 'ExampleRayCasting', factory: (view: HTMLCanvasElement) => new ExampleRayCasting(view) },
  { name: 'ExampleRayCasting2', factory: (view: HTMLCanvasElement) => new ExampleRayCasting(view, true) },
  { name: 'ExampleVisibilityCone', factory: (view: HTMLCanvasElement) => new ExampleVisibilityCone(view) },
  { name: 'ExamplePathFinding1', factory: (view: HTMLCanvasElement) => new ExamplePathfinding(view, MapType.TILE, PathAlgorithm.BREADTH_FIRST) },
  { name: 'ExamplePathFinding2', factory: (view: HTMLCanvasElement) => new ExamplePathfinding(view, MapType.TILE, PathAlgorithm.DIJKSTRA) },
  { name: 'ExamplePathFinding3', factory: (view: HTMLCanvasElement) => new ExamplePathfinding(view, MapType.TILE, PathAlgorithm.ASTAR, DistanceMeasurement.MANHATTAN) },
  { name: 'ExamplePathFinding4', factory: (view: HTMLCanvasElement) => new ExamplePathfinding(view, MapType.TILE, PathAlgorithm.ASTAR, DistanceMeasurement.EUCLIDEAN) },
  { name: 'ExamplePathFinding5', factory: (view: HTMLCanvasElement) => new ExamplePathfinding(view, MapType.OCTILE, PathAlgorithm.ASTAR, DistanceMeasurement.MANHATTAN) },
  { name: 'ExamplePathFinding6', factory: (view: HTMLCanvasElement) => new ExamplePathfinding(view, MapType.OCTILE, PathAlgorithm.ASTAR, DistanceMeasurement.EUCLIDEAN, Heuristics.DEFAULT) },
  { name: 'ExamplePathFinding7', factory: (view: HTMLCanvasElement) => new ExamplePathfinding(view, MapType.OCTILE, PathAlgorithm.ASTAR, DistanceMeasurement.EUCLIDEAN, Heuristics.OPTIMISTIC) },
  { name: 'ExamplePathFinding8', factory: (view: HTMLCanvasElement) => new ExamplePathfinding(view, MapType.OCTILE, PathAlgorithm.ASTAR, DistanceMeasurement.EUCLIDEAN, Heuristics.PESSIMISTIC) },
  { name: 'ExamplePathFinding9', factory: (view: HTMLCanvasElement) => new ExamplePathfinding(view, MapType.OCTILE, PathAlgorithm.ASTAR, DistanceMeasurement.EUCLIDEAN, Heuristics.VERY_OPTIMISTIC) },
  { name: 'ExamplePathFinding10', factory: (view: HTMLCanvasElement) => new ExamplePathfinding(view, MapType.OCTILE, PathAlgorithm.ASTAR, DistanceMeasurement.EUCLIDEAN, Heuristics.VERY_PESSIMISTIC) },
  { name: 'ExamplePerlinNoise', factory: (view: HTMLCanvasElement) => new ExamplePerlinNoise(view) },
);