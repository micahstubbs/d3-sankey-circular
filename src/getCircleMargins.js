import { max } from 'd3-array'

export default function getCircleMargins(graph, verticalMargin, baseRadius) {
  var totalTopLinksWidth = 0,
    totalBottomLinksWidth = 0,
    totalRightLinksWidth = 0,
    totalLeftLinksWidth = 0

  var maxColumn = max(graph.nodes, function(node) {
    return node.column
  })

  graph.links.forEach(function(link) {
    if (link.circular) {
      if (link.circularLinkType == 'top') {
        totalTopLinksWidth = totalTopLinksWidth + link.width
      } else {
        totalBottomLinksWidth = totalBottomLinksWidth + link.width
      }

      if (link.target.column == 0) {
        totalLeftLinksWidth = totalLeftLinksWidth + link.width
      }

      if (link.source.column == maxColumn) {
        totalRightLinksWidth = totalRightLinksWidth + link.width
      }
    }
  })

  //account for radius of curves and padding between links
  totalTopLinksWidth =
    totalTopLinksWidth > 0
      ? totalTopLinksWidth + verticalMargin + baseRadius
      : totalTopLinksWidth
  totalBottomLinksWidth =
    totalBottomLinksWidth > 0
      ? totalBottomLinksWidth + verticalMargin + baseRadius
      : totalBottomLinksWidth
  totalRightLinksWidth =
    totalRightLinksWidth > 0
      ? totalRightLinksWidth + verticalMargin + baseRadius
      : totalRightLinksWidth
  totalLeftLinksWidth =
    totalLeftLinksWidth > 0
      ? totalLeftLinksWidth + verticalMargin + baseRadius
      : totalLeftLinksWidth

  return {
    top: totalTopLinksWidth,
    bottom: totalBottomLinksWidth,
    left: totalLeftLinksWidth,
    right: totalRightLinksWidth
  }
}
