import { max } from 'd3-array'

// Update the x0, y0, x1 and y1 for the sankeyCircular, to allow space for any circular links
export default function scaleSankeySize(graph, margin, x0, x1, y0, y1, dx) {
  var maxColumn = max(graph.nodes, function(node) {
    return node.column
  })

  var currentWidth = x1 - x0
  var currentHeight = y1 - y0

  var newWidth = currentWidth + margin.right + margin.left
  var newHeight = currentHeight + margin.top + margin.bottom

  var scaleX = currentWidth / newWidth
  var scaleY = currentHeight / newHeight

  x0 = x0 * scaleX + margin.left
  x1 = margin.right == 0 ? x1 : x1 * scaleX
  y0 = y0 * scaleY + margin.top
  y1 = y1 * scaleY

  graph.nodes.forEach(function(node) {
    node.x0 = x0 + node.column * ((x1 - x0 - dx) / maxColumn)
    node.x1 = node.x0 + dx
  })

  return { scaleY, x0, x1, y0, y1, dx }
}
