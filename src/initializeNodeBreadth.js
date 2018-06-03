import { min, sum } from 'd3-array'

import numberOfNonSelfLinkingCycles from './numberOfNonSelfLinkingCycles'
import scaleSankeySize from './scaleSankeySize'
import getCircleMargins from './getCircleMargins'

export default function initializeNodeBreadth(
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
) {
  let newPy = py
  // update `newPy` if nodePadding has been set
  if (paddingRatio) {
    var padding = Infinity
    columns.forEach(function(nodes) {
      var thisPadding = y1 * paddingRatio / (nodes.length + 1)
      padding = thisPadding < padding ? thisPadding : padding
    })
    newPy = padding
  }

  var ky = min(columns, function(nodes) {
    return (y1 - y0 - (nodes.length - 1) * newPy) / sum(nodes, value)
  })

  //calculate the widths of the links
  ky = ky * scale

  graph.links.forEach(function(link) {
    link.width = link.value * ky
  })

  //determine how much to scale down the chart, based on circular links
  var margin = getCircleMargins(graph, verticalMargin, baseRadius)
  const scaleSankeySizeResult = scaleSankeySize(
    graph,
    margin,
    x0,
    x1,
    y0,
    y1,
    dx
  )
  let ratio = scaleSankeySizeResult.scaleY
  let newX0 = scaleSankeySizeResult.x0
  let newX1 = scaleSankeySizeResult.x1
  let newY0 = scaleSankeySizeResult.y0
  let newY1 = scaleSankeySizeResult.y1
  let newDx = scaleSankeySizeResult.dx

  //re-calculate widths
  ky = ky * ratio

  graph.links.forEach(function(link) {
    link.width = link.value * ky
  })

  columns.forEach(function(nodes) {
    var nodesLength = nodes.length
    nodes.forEach(function(node, i) {
      if (node.depth == columns.length - 1 && nodesLength == 1) {
        node.y0 = newY1 / 2 - node.value * ky
        node.y1 = node.y0 + node.value * ky
      } else if (node.depth == 0 && nodesLength == 1) {
        node.y0 = newY1 / 2 - node.value * ky
        node.y1 = node.y0 + node.value * ky
      } else if (node.partOfCycle) {
        if (numberOfNonSelfLinkingCycles(node, id) == 0) {
          node.y0 = newY1 / 2 + i
          node.y1 = node.y0 + node.value * ky
        } else if (node.circularLinkType == 'top') {
          node.y0 = newY0 + i
          node.y1 = node.y0 + node.value * ky
        } else {
          node.y0 = newY1 - node.value * ky - i
          node.y1 = node.y0 + node.value * ky
        }
      } else {
        if (margin.top == 0 || margin.bottom == 0) {
          node.y0 = (newY1 - newY0) / nodesLength * i
          node.y1 = node.y0 + node.value * ky
        } else {
          node.y0 = (newY1 - newY0) / 2 - nodesLength / 2 + i
          node.y1 = node.y0 + node.value * ky
        }
      }
    })
  })
  return {
    newPy,
    columns,
    graph,
    newX0,
    newX1,
    newY0,
    newY1,
    newDx
  }
}
