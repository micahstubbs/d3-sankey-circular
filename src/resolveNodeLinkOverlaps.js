// Move any nodes that overlap links which span 2+ columns
export default function resolveNodeLinkOverlaps(graph, y0, y1, id) {
  graph.links.forEach(function(link) {
    if (link.circular) {
      return
    }

    if (link.target.column - link.source.column > 1) {
      var columnToTest = link.source.column + 1
      var maxColumnToTest = link.target.column - 1

      var i = 1
      var numberOfColumnsToTest = maxColumnToTest - columnToTest + 1

      for (
        columnToTest, i = 1;
        columnToTest <= maxColumnToTest;
        columnToTest++, i++
      ) {
        graph.nodes.forEach(function(node) {
          if (node.column == columnToTest) {
            var t = i / (numberOfColumnsToTest + 1)

            // Find all the points of a cubic bezier curve in javascript
            // https://stackoverflow.com/questions/15397596/find-all-the-points-of-a-cubic-bezier-curve-in-javascript

            var B0_t = Math.pow(1 - t, 3)
            var B1_t = 3 * t * Math.pow(1 - t, 2)
            var B2_t = 3 * Math.pow(t, 2) * (1 - t)
            var B3_t = Math.pow(t, 3)

            var py_t =
              B0_t * link.y0 + B1_t * link.y0 + B2_t * link.y1 + B3_t * link.y1

            var linkY0AtColumn = py_t - link.width / 2
            var linkY1AtColumn = py_t + link.width / 2

            // If top of link overlaps node, push node up
            if (linkY0AtColumn > node.y0 && linkY0AtColumn < node.y1) {
              var dy = node.y1 - linkY0AtColumn + 10
              dy = node.circularLinkType == 'bottom' ? dy : -dy

              node = adjustNodeHeight(node, dy, y0, y1)

              // check if other nodes need to move up too
              graph.nodes.forEach(function(otherNode) {
                // don't need to check itself or nodes at different columns
                if (
                  getNodeID(otherNode, id) == getNodeID(node, id) ||
                  otherNode.column != node.column
                ) {
                  return
                }
                if (nodesOverlap(node, otherNode)) {
                  adjustNodeHeight(otherNode, dy, y0, y1)
                }
              })
            } else if (linkY1AtColumn > node.y0 && linkY1AtColumn < node.y1) {
              // If bottom of link overlaps node, push node down
              var dy = linkY1AtColumn - node.y0 + 10

              node = adjustNodeHeight(node, dy, y0, y1)

              // check if other nodes need to move down too
              graph.nodes.forEach(function(otherNode) {
                // don't need to check itself or nodes at different columns
                if (
                  getNodeID(otherNode, id) == getNodeID(node, id) ||
                  otherNode.column != node.column
                ) {
                  return
                }
                if (otherNode.y0 < node.y1 && otherNode.y1 > node.y1) {
                  adjustNodeHeight(otherNode, dy, y0, y1)
                }
              })
            } else if (linkY0AtColumn < node.y0 && linkY1AtColumn > node.y1) {
              // if link completely overlaps node
              var dy = linkY1AtColumn - node.y0 + 10

              node = adjustNodeHeight(node, dy, y0, y1)

              graph.nodes.forEach(function(otherNode) {
                // don't need to check itself or nodes at different columns
                if (
                  getNodeID(otherNode, id) == getNodeID(node, id) ||
                  otherNode.column != node.column
                ) {
                  return
                }
                if (otherNode.y0 < node.y1 && otherNode.y1 > node.y1) {
                  adjustNodeHeight(otherNode, dy, y0, y1)
                }
              })
            }
          }
        })
      }
    }
  })
}
