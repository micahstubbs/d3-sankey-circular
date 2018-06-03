import { ascending } from 'd3-array'
import { nest } from 'd3-collection'
import cloneDeep from '../lib/cloneDeep'

import resolveCollisions from './resolveCollisions'
import relaxLeftAndRight from './relaxLeftAndRight'
import initializeNodeBreadth from './initializeNodeBreadth'

// Assign nodes' breadths, and then shift nodes that overlap (resolveCollisions)
export default function computeNodeBreadths(
  inputGraph,
  iterations,
  id,
  scale,
  paddingRatio,
  verticalMargin,
  baseRadius,
  value,
  x0,
  x1,
  y0,
  y1,
  dx,
  py
) {
  let graph = cloneDeep(inputGraph)
  let columns = nest()
    .key(function(d) {
      return d.column
    })
    .sortKeys(ascending)
    .entries(graph.nodes)
    .map(function(d) {
      return d.values
    })

  const initializeNodeBreadthResult = initializeNodeBreadth(
    id,
    scale,
    paddingRatio,
    columns,
    x0,
    x1,
    y0,
    y1,
    dx,
    py,
    value,
    graph,
    verticalMargin,
    baseRadius
  )
  const newPy = initializeNodeBreadthResult.newPy
  columns = initializeNodeBreadthResult.columns
  graph = initializeNodeBreadthResult.graph
  const newX0 = initializeNodeBreadthResult.newX0
  const newX1 = initializeNodeBreadthResult.newX1
  const newY0 = initializeNodeBreadthResult.newY0
  const newY1 = initializeNodeBreadthResult.newY1
  const newDx = initializeNodeBreadthResult.newDx

  resolveCollisions(columns, newY0, newY1, newPy)

  for (var alpha = 1, n = iterations; n > 0; --n) {
    relaxLeftAndRight((alpha *= 0.99), id, columns, newY1)
    resolveCollisions(columns, newY0, newY1, newPy)
  }
  return {
    newPy,
    graph,
    newX0,
    newX1,
    newY0,
    newY1,
    newDx
  }
}
