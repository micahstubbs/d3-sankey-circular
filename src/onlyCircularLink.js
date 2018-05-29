// Check if a circular link is the only circular link for both its source and target node
export default function onlyCircularLink(link) {
  var nodeSourceLinks = link.source.sourceLinks
  var sourceCount = 0
  nodeSourceLinks.forEach(function(l) {
    sourceCount = l.circular ? sourceCount + 1 : sourceCount
  })

  var nodeTargetLinks = link.target.targetLinks
  var targetCount = 0
  nodeTargetLinks.forEach(function(l) {
    targetCount = l.circular ? targetCount + 1 : targetCount
  })

  if (sourceCount > 1 || targetCount > 1) {
    return false
  } else {
    return true
  }
}
