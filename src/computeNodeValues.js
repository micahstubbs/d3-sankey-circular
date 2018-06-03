import cloneDeep from '../lib/cloneDeep'
import { sum } from 'd3-array'

// Compute the value (size) and cycleness of each node by summing the associated links.
export default function computeNodeValues(inputGraph, value) {
  const graph = cloneDeep(inputGraph)
  graph.nodes.forEach(function(node) {
    node.partOfCycle = false
    node.value = Math.max(
      sum(node.sourceLinks, value),
      sum(node.targetLinks, value)
    )
    node.sourceLinks.forEach(function(link) {
      if (link.circular) {
        node.partOfCycle = true
        node.circularLinkType = link.circularLinkType
      }
    })
    node.targetLinks.forEach(function(link) {
      if (link.circular) {
        node.partOfCycle = true
        node.circularLinkType = link.circularLinkType
      }
    })
  })
  return graph
}
