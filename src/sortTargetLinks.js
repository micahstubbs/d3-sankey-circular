import getNodeID from './getNodeID'
import sameInclines from './sameInclines'
import linkPerpendicularYToLinkSource from './linkPerpendicularYToLinkSource'

// sort and set the links' y1 for each node
export default function sortTargetLinks(graph, y1, id) {
  graph.nodes.forEach(function(node) {
    var nodesTargetLinks = graph.links.filter(function(l) {
      return getNodeID(l.target, id) == getNodeID(node, id)
    })

    var nodesTargetLinksLength = nodesTargetLinks.length

    if (nodesTargetLinksLength > 1) {
      nodesTargetLinks.sort(function(link1, link2) {
        // if both are not circular, the base on the source y position
        if (!link1.circular && !link2.circular) {
          if (link1.source.column == link2.source.column) {
            return link1.y0 - link2.y0
          } else if (!sameInclines(link1, link2)) {
            return link1.y0 - link2.y0
          } else {
            // get the angle of the link to the further source node (ie the smaller column)
            if (link2.source.column < link1.source.column) {
              var link2Adj = linkPerpendicularYToLinkSource(link2, link1)

              return link1.y0 - link2Adj
            }
            if (link1.source.column < link2.source.column) {
              var link1Adj = linkPerpendicularYToLinkSource(link1, link2)

              return link1Adj - link2.y0
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
            if (link1.source.column === link2.source.column) {
              return link1.source.y1 - link2.source.y1
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link1.source.column - link2.source.column
            }
          } else if (
            link1.circularLinkType === link2.circularLinkType &&
            link1.circularLinkType == 'bottom'
          ) {
            // ...and they both loop the same way (both bottom)
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.source.column === link2.source.column) {
              return link1.source.y1 - link2.source.y1
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link2.source.column - link1.source.column
            }
          } else {
            // ...and they loop around different ways, the move top up and bottom down
            return link1.circularLinkType == 'top' ? -1 : 1
          }
        }
      })
    }

    // update y1 for links
    var yTargetOffset = node.y0

    nodesTargetLinks.forEach(function(link) {
      link.y1 = yTargetOffset + link.width / 2
      yTargetOffset = yTargetOffset + link.width
    })

    // correct any circular bottom links so they are at the bottom of the node
    nodesTargetLinks.forEach(function(link, i) {
      if (link.circularLinkType == 'bottom') {
        var j = i + 1
        var offsetFromBottom = 0
        // sum the widths of any links that are below this link
        for (j; j < nodesTargetLinksLength; j++) {
          offsetFromBottom = offsetFromBottom + nodesTargetLinks[j].width
        }
        link.y1 = node.y1 - offsetFromBottom - link.width / 2
      }
    })
  })
}
