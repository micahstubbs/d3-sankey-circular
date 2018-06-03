import ascendingSourceBreadth from './ascendingSourceBreadth'
import ascendingTargetBreadth from './ascendingTargetBreadth'

// Assign the links y0 and y1 based on source/target nodes position,
// plus the link's relative position to other links to the same node
export default function computeLinkBreadths(graph) {
  graph.nodes.forEach(function(node) {
    node.sourceLinks.sort(ascendingTargetBreadth)
    node.targetLinks.sort(ascendingSourceBreadth)
  })
  graph.nodes.forEach(function(node) {
    var y0 = node.y0
    var y1 = y0

    // start from the bottom of the node for cycle links
    var y0cycle = node.y1
    var y1cycle = y0cycle

    node.sourceLinks.forEach(function(link) {
      if (link.circular) {
        link.y0 = y0cycle - link.width / 2
        y0cycle = y0cycle - link.width
      } else {
        link.y0 = y0 + link.width / 2
        y0 += link.width
      }
    })
    node.targetLinks.forEach(function(link) {
      if (link.circular) {
        link.y1 = y1cycle - link.width / 2
        y1cycle = y1cycle - link.width
      } else {
        link.y1 = y1 + link.width / 2
        y1 += link.width
      }
    })
  })
}
