import createsCycle from './createsCycle'

// Identify circles in the link objects
export default function identifyCircles(graph, id) {
  var addedLinks = []
  var circularLinkID = 0
  graph.links.forEach(function(link) {
    if (createsCycle(link.source, link.target, addedLinks, id)) {
      link.circular = true
      link.circularLinkID = circularLinkID
      circularLinkID = circularLinkID + 1
    } else {
      link.circular = false
      addedLinks.push(link)
    }
  })
}
