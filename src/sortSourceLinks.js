import getNodeID from './getNodeID'
import sameInclines from './sameInclines'
import linkPerpendicularYToLinkTarget from './linkPerpendicularYToLinkTarget'
import linkAngle from './linkAngle'

// sort and set the links' y0 for each node
export default function sortSourceLinks(graph, y1, id) {
  graph.nodes.forEach(function(node) {
    // move any nodes up which are off the bottom
    if (node.y + (node.y1 - node.y0) > y1) {
      node.y = node.y - (node.y + (node.y1 - node.y0) - y1)
    }

    var nodesSourceLinks = graph.links.filter(function(l) {
      return getNodeID(l.source, id) == getNodeID(node, id)
    })

    var nodeSourceLinksLength = nodesSourceLinks.length

    // if more than 1 link then sort
    if (nodeSourceLinksLength > 1) {
      nodesSourceLinks.sort(function(link1, link2) {
        // if both are not circular...
        if (!link1.circular && !link2.circular) {
          // if the target nodes are the same column, then sort by the link's target y
          if (link1.target.column == link2.target.column) {
            return link1.y1 - link2.y1
          } else if (!sameInclines(link1, link2)) {
            // if the links slope in different directions, then sort by the link's target y
            return link1.y1 - link2.y1

            // if the links slope in same directions, then sort by any overlap
          } else {
            if (link1.target.column > link2.target.column) {
              var link2Adj = linkPerpendicularYToLinkTarget(link2, link1)
              return link1.y1 - link2Adj
            }
            if (link2.target.column > link1.target.column) {
              var link1Adj = linkPerpendicularYToLinkTarget(link1, link2)
              return link1Adj - link2.y1
            }
          }
        }

        // if only one is circular, the move top links up, or bottom links down
        if (link1.circular && !link2.circular) {
          return link1.circularLinkType == 'top' ? -1 : 1
        } else if (link2.circular && !link1.circular) {
          return link2.circularLinkType == 'top' ? 1 : -1
        }

        // if both links are circular...
        if (link1.circular && link2.circular) {
          // ...and they both loop the same way (both top)
          if (
            link1.circularLinkType === link2.circularLinkType &&
            link1.circularLinkType == 'top'
          ) {
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.target.column === link2.target.column) {
              return link1.target.y1 - link2.target.y1
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link2.target.column - link1.target.column
            }
          } else if (
            link1.circularLinkType === link2.circularLinkType &&
            link1.circularLinkType == 'bottom'
          ) {
            // ...and they both loop the same way (both bottom)
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.target.column === link2.target.column) {
              return link2.target.y1 - link1.target.y1
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link1.target.column - link2.target.column
            }
          } else {
            // ...and they loop around different ways, the move top up and bottom down
            return link1.circularLinkType == 'top' ? -1 : 1
          }
        }
      })
    }

    // update y0 for links
    var ySourceOffset = node.y0

    nodesSourceLinks.forEach(function(link) {
      link.y0 = ySourceOffset + link.width / 2
      ySourceOffset = ySourceOffset + link.width
    })

    // correct any circular bottom links so they are at the bottom of the node
    nodesSourceLinks.forEach(function(link, i) {
      if (link.circularLinkType == 'bottom') {
        var j = i + 1
        var offsetFromBottom = 0
        // sum the widths of any links that are below this link
        for (j; j < nodeSourceLinksLength; j++) {
          offsetFromBottom = offsetFromBottom + nodesSourceLinks[j].width
        }
        link.y0 = node.y1 - offsetFromBottom - link.width / 2
      }
    })
  })
}
