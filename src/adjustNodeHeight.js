// update a node, and its associated links, vertical positions (y0, y1)
export default function adjustNodeHeight(node, dy, sankeyY0, sankeyY1) {
  if (node.y0 + dy >= sankeyY0 && node.y1 + dy <= sankeyY1) {
    node.y0 = node.y0 + dy
    node.y1 = node.y1 + dy

    node.targetLinks.forEach(function(l) {
      l.y1 = l.y1 + dy
    })

    node.sourceLinks.forEach(function(l) {
      l.y0 = l.y0 + dy
    })
  }
  return node
}
