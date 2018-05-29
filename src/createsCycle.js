import getNodeID from './getNodeID'
import findLinksOutward from './findLinksOutward'

// Checks if link creates a cycle
export default function createsCycle(originalSource, nodeToCheck, graph, id) {
  // Check for self linking nodes
  if (getNodeID(originalSource, id) == getNodeID(nodeToCheck, id)) {
    return true
  }

  if (graph.length == 0) {
    return false
  }

  var nextLinks = findLinksOutward(nodeToCheck, graph)
  // leaf node check
  if (nextLinks.length == 0) {
    return false
  }

  // cycle check
  for (var i = 0; i < nextLinks.length; i++) {
    var nextLink = nextLinks[i]

    if (nextLink.target === originalSource) {
      return true
    }

    // Recurse
    if (createsCycle(originalSource, nextLink.target, graph, id)) {
      return true
    }
  }

  // Exhausted all links
  return false
}
