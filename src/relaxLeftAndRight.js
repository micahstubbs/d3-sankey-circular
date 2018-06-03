import { mean } from 'd3-array'

import linkSourceCenter from './linkSourceCenter'
import linkTargetCenter from './linkTargetCenter'
import nodeCenter from './nodeCenter'
import numberOfNonSelfLinkingCycles from './numberOfNonSelfLinkingCycles'

// For each node in each column,
// check the node's vertical position in relation to
// its target's and source's vertical position
// and shift up/down to be closer to
// the vertical middle of those targets and sources
export default function relaxLeftAndRight(alpha, id, columns, y1) {
  var columnsLength = columns.length

  columns.forEach(function(nodes) {
    var n = nodes.length
    var depth = nodes[0].depth

    nodes.forEach(function(node) {
      // check the node is not an orphan
      var nodeHeight
      if (node.sourceLinks.length || node.targetLinks.length) {
        if (node.partOfCycle && numberOfNonSelfLinkingCycles(node, id) > 0) {

          /* empty */
        } else if (depth == 0 && n == 1) {
          nodeHeight = node.y1 - node.y0

          node.y0 = y1 / 2 - nodeHeight / 2
          node.y1 = y1 / 2 + nodeHeight / 2
        } else if (depth == columnsLength - 1 && n == 1) {
          nodeHeight = node.y1 - node.y0

          node.y0 = y1 / 2 - nodeHeight / 2
          node.y1 = y1 / 2 + nodeHeight / 2
        } else {
          var avg = 0

          var avgTargetY = mean(node.sourceLinks, linkTargetCenter)
          var avgSourceY = mean(node.targetLinks, linkSourceCenter)

          if (avgTargetY && avgSourceY) {
            avg = (avgTargetY + avgSourceY) / 2
          } else {
            avg = avgTargetY || avgSourceY
          }

          var dy = (avg - nodeCenter(node)) * alpha
          // positive if it node needs to move down
          node.y0 += dy
          node.y1 += dy
        }
      }
    })
  })
}
