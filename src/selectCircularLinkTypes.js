import getNodeID from './getNodeID'
import selfLinking from './selfLinking'

// Assign a circular link type (top or bottom), based on:
// - if the source/target node already has circular links, then use the same type
// - if not, choose the type with fewer links
export default function selectCircularLinkTypes(graph, id) {
  var numberOfTops = 0
  var numberOfBottoms = 0
  graph.links.forEach(function(link) {
    if (link.circular) {
      // if either souce or target has type already use that
      if (link.source.circularLinkType || link.target.circularLinkType) {
        // default to source type if available
        link.circularLinkType = link.source.circularLinkType
          ? link.source.circularLinkType
          : link.target.circularLinkType
      } else {
        link.circularLinkType =
          numberOfTops < numberOfBottoms ? 'top' : 'bottom'
      }

      if (link.circularLinkType == 'top') {
        numberOfTops = numberOfTops + 1
      } else {
        numberOfBottoms = numberOfBottoms + 1
      }

      graph.nodes.forEach(function(node) {
        if (
          getNodeID(node, id) == getNodeID(link.source, id) ||
          getNodeID(node, id) == getNodeID(link.target, id)
        ) {
          node.circularLinkType = link.circularLinkType
        }
      })
    }
  })

  //correct self-linking links to be same direction as node
  graph.links.forEach(function(link) {
    if (link.circular) {
      //if both source and target node are same type, then link should have same type
      if (link.source.circularLinkType == link.target.circularLinkType) {
        link.circularLinkType = link.source.circularLinkType
      }
      //if link is self-linking, then link should have same type as node
      if (selfLinking(link, id)) {
        link.circularLinkType = link.source.circularLinkType
      }
    }
  })
}
