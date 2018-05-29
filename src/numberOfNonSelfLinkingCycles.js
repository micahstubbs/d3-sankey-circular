import selfLinking from './selfLinking'

// Return the number of circular links for node, not including self linking links
export default function numberOfNonSelfLinkingCycles(node, id) {
  var sourceCount = 0
  node.sourceLinks.forEach(function(l) {
    sourceCount =
      l.circular && !selfLinking(l, id) ? sourceCount + 1 : sourceCount
  })

  var targetCount = 0
  node.targetLinks.forEach(function(l) {
    targetCount =
      l.circular && !selfLinking(l, id) ? targetCount + 1 : targetCount
  })

  return sourceCount + targetCount
}
