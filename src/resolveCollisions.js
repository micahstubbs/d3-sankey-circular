import ascendingBreadth from './ascendingBreadth'

// For each column, check if nodes are overlapping, and if so, shift up/down
export default function resolveCollisions(columns, y0, y1, py) {
  columns.forEach(function(nodes) {
    var node,
      dy,
      y = y0,
      n = nodes.length,
      i

    // Push any overlapping nodes down.
    nodes.sort(ascendingBreadth)

    for (i = 0; i < n; ++i) {
      node = nodes[i]
      dy = y - node.y0

      if (dy > 0) {
        node.y0 += dy
        node.y1 += dy
      }
      y = node.y1 + py
    }

    // If the bottommost node goes outside the bounds, push it back up.
    dy = y - py - y1
    if (dy > 0) {
      (y = node.y0 -= dy), (node.y1 -= dy)

      // Push any overlapping nodes back up.
      for (i = n - 2; i >= 0; --i) {
        node = nodes[i]
        dy = node.y1 + py - y
        if (dy > 0) (node.y0 -= dy), (node.y1 -= dy)
        y = node.y0
      }
    }
  })
}
