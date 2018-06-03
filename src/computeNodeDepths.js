import cloneDeep from '../lib/cloneDeep'

// Iteratively assign the depth for each node.
// Nodes are assigned the maximum depth of incoming neighbors plus one;
// nodes with no incoming links are assigned depth zero, while
// nodes with no outgoing links are assigned the maximum depth.
export default function computeNodeDepths(inputGraph, align) {
  const graph = cloneDeep(inputGraph)
  var nodes, next, x

  for (
    nodes = graph.nodes, next = [], x = 0;
    nodes.length;
    ++x, nodes = next, next = []
  ) {
    nodes.forEach(function(node) {
      node.depth = x
      node.sourceLinks.forEach(function(link) {
        if (next.indexOf(link.target) < 0 && !link.circular) {
          next.push(link.target)
        }
      })
    })
  }

  for (
    nodes = graph.nodes, next = [], x = 0;
    nodes.length;
    ++x, nodes = next, next = []
  ) {
    nodes.forEach(function(node) {
      node.height = x
      node.targetLinks.forEach(function(link) {
        if (next.indexOf(link.source) < 0 && !link.circular) {
          next.push(link.source)
        }
      })
    })
  }

  // assign column numbers, and get max value
  graph.nodes.forEach(function(node) {
    node.column = Math.floor(align.call(null, node, x))
  })
  return graph
}
