import cloneDeep from '../lib/cloneDeep'
import { map } from 'd3-collection'

import find from './find'

// Populate the sourceLinks and targetLinks for each node.
// Also, if the source and target are not objects, assume they are indices.
export default function computeNodeLinks(inputGraph, id) {
  const graph = cloneDeep(inputGraph)
  graph.nodes.forEach(function(node, i) {
    node.index = i
    node.sourceLinks = []
    node.targetLinks = []
  })
  var nodeById = map(graph.nodes, id)
  graph.links.forEach(function(link, i) {
    link.index = i
    var source = link.source
    var target = link.target
    if (typeof source !== 'object') {
      source = link.source = find(nodeById, source)
    }
    if (typeof target !== 'object') {
      target = link.target = find(nodeById, target)
    }
    source.sourceLinks.push(link)
    target.targetLinks.push(link)
  })
  return graph
}
