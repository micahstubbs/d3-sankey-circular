// https://github.com/tomshanley/d3-sankeyCircular-circular
// fork of https://github.com/d3/d3-sankeyCircular copyright Mike Bostock
// external imports
import { ascending, min, max, mean, sum } from 'd3-array'
import { map, nest } from 'd3-collection'

// project imports
import constant from './constant'
import { justify } from './align'
import fillHeight from './fillHeight'
import sortTargetLinks from './sortTargetLinks'
import getNodeID from './getNodeID'
import sameInclines from './sameInclines'
import incline from './incline'
import linkAngle from './linkAngle'
import linkXLength from './linkXLength'
import createCircularPathString from './createCircularPathString'
import addCircularPathData from './addCircularPathData'
import selfLinking from './selfLinking'
import adjustNodeHeight from './adjustNodeHeight'
import nodesOverlap from './nodesOverlap'
import ascendingBreadth from './ascendingBreadth'
import findLinksOutward from './findLinksOutward'

// sort links' breadth (ie top to bottom in a column), based on their source nodes' breadths
function ascendingSourceBreadth(a, b) {
  return ascendingBreadth(a.source, b.source) || a.index - b.index
}

// sort links' breadth (ie top to bottom in a column), based on their target nodes' breadths
function ascendingTargetBreadth(a, b) {
  return ascendingBreadth(a.target, b.target) || a.index - b.index
}

// return the value of a node or link
function value(d) {
  return d.value
}

// return the vertical center of a node
function nodeCenter(node) {
  return (node.y0 + node.y1) / 2
}

// return the vertical center of a link's source node
function linkSourceCenter(link) {
  return nodeCenter(link.source)
}
// return the vertical center of a link's target node
function linkTargetCenter(link) {
  return nodeCenter(link.target)
}

/* function weightedSource (link) {
    return nodeCenter(link.source) * link.value
  } */

/* function weightedTarget (link) {
    return nodeCenter(link.target) * link.value
  } */

// Return the default value for ID for node, d.index
function defaultId(d) {
  return d.index
}

// Return the default object the graph's nodes, graph.nodes
function defaultNodes(graph) {
  return graph.nodes
}

// Return the default object the graph's nodes, graph.links
function defaultLinks(graph) {
  return graph.links
}

// Return the node from the collection that matches the provided ID, or throw an error if no match
function find(nodeById, id) {
  var node = nodeById.get(id)
  if (!node) throw new Error('missing: ' + id)
  return node
}

// The main sankeyCircular functions

// Some constants for circular link calculations
var verticalMargin = 25
var baseRadius = 10
var scale = 0.3 //Possibly let user control this, although anything over 0.5 starts to get too cramped

export default function() {
  // Set the default values
  var x0 = 0,
    y0 = 0,
    x1 = 1,
    y1 = 1, // extent
    dx = 24, // nodeWidth
    py, // nodePadding, for vertical postioning
    id = defaultId,
    align = justify,
    nodes = defaultNodes,
    links = defaultLinks,
    iterations = 32,
    circularLinkGap = 2,
    paddingRatio

  function sankeyCircular() {
    var graph = {
      nodes: nodes.apply(null, arguments),
      links: links.apply(null, arguments)
    }

    // Process the graph's nodes and links, setting their positions

    // 1.  Associate the nodes with their respective links, and vice versa
    computeNodeLinks(graph)

    // 2.  Determine which links result in a circular path in the graph
    identifyCircles(graph, id)

    // 4. Calculate the nodes' values, based on the values of the incoming and outgoing links
    computeNodeValues(graph)

    // 5.  Calculate the nodes' depth based on the incoming and outgoing links
    //     Sets the nodes':
    //     - depth:  the depth in the graph
    //     - column: the depth (0, 1, 2, etc), as is relates to visual position from left to right
    //     - x0, x1: the x coordinates, as is relates to visual position from left to right
    computeNodeDepths(graph)

    // 3.  Determine how the circular links will be drawn,
    //     either travelling back above the main chart ("top")
    //     or below the main chart ("bottom")
    selectCircularLinkTypes(graph, id)

    // 6.  Calculate the nodes' and links' vertical position within their respective column
    //     Also readjusts sankeyCircular size if circular links are needed, and node x's
    computeNodeBreadths(graph, iterations, id)
    computeLinkBreadths(graph)

    // 7.  Sort links per node, based on the links' source/target nodes' breadths
    // 8.  Adjust nodes that overlap links that span 2+ columns

    var linkSortingIterations = 4 //Possibly let user control this number, like the iterations over node placement
    for (var iteration = 0; iteration < linkSortingIterations; iteration++) {
      sortSourceLinks(graph, y1, id)
      sortTargetLinks(graph, y1, id)
      resolveNodeLinkOverlaps(graph, y0, y1, id)
      sortSourceLinks(graph, y1, id)
      sortTargetLinks(graph, y1, id)
    }

    // 8.1  Adjust node and link positions back to fill height of chart area if compressed
    fillHeight(graph, y0, y1)

    // 9. Calculate visually appealling path for the circular paths, and create the "d" string
    addCircularPathData(
      graph,
      circularLinkGap,
      y1,
      id,
      baseRadius,
      verticalMargin
    )

    return graph
  } // end of sankeyCircular function

  // Set the sankeyCircular parameters
  // nodeID, nodeAlign, nodeWidth, nodePadding, nodes, links, size, extent, iterations, nodePaddingRatio, circularLinkGap
  sankeyCircular.nodeId = function(_) {
    return arguments.length
      ? ((id = typeof _ === 'function' ? _ : constant(_)), sankeyCircular)
      : id
  }

  sankeyCircular.nodeAlign = function(_) {
    return arguments.length
      ? ((align = typeof _ === 'function' ? _ : constant(_)), sankeyCircular)
      : align
  }

  sankeyCircular.nodeWidth = function(_) {
    return arguments.length ? ((dx = +_), sankeyCircular) : dx
  }

  sankeyCircular.nodePadding = function(_) {
    return arguments.length ? ((py = +_), sankeyCircular) : py
  }

  sankeyCircular.nodes = function(_) {
    return arguments.length
      ? ((nodes = typeof _ === 'function' ? _ : constant(_)), sankeyCircular)
      : nodes
  }

  sankeyCircular.links = function(_) {
    return arguments.length
      ? ((links = typeof _ === 'function' ? _ : constant(_)), sankeyCircular)
      : links
  }

  sankeyCircular.size = function(_) {
    return arguments.length
      ? ((x0 = y0 = 0), (x1 = +_[0]), (y1 = +_[1]), sankeyCircular)
      : [x1 - x0, y1 - y0]
  }

  sankeyCircular.extent = function(_) {
    return arguments.length
      ? ((x0 = +_[0][0]),
        (x1 = +_[1][0]),
        (y0 = +_[0][1]),
        (y1 = +_[1][1]),
        sankeyCircular)
      : [[x0, y0], [x1, y1]]
  }

  sankeyCircular.iterations = function(_) {
    return arguments.length ? ((iterations = +_), sankeyCircular) : iterations
  }

  sankeyCircular.circularLinkGap = function(_) {
    return arguments.length
      ? ((circularLinkGap = +_), sankeyCircular)
      : circularLinkGap
  }

  sankeyCircular.nodePaddingRatio = function(_) {
    return arguments.length
      ? ((paddingRatio = +_), sankeyCircular)
      : paddingRatio
  }

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks(graph) {
    graph.nodes.forEach(function(node, i) {
      node.index = i
      node.sourceLinks = []
      node.targetLinks = []
    })
    var nodeById = map(graph.nodes, id)
    graph.links.forEach(function(link, i) {
      link.index = i
      var source = link.source
      var target = link.target
      if (typeof source !== 'object') {
        source = link.source = find(nodeById, source)
      }
      if (typeof target !== 'object') {
        target = link.target = find(nodeById, target)
      }
      source.sourceLinks.push(link)
      target.targetLinks.push(link)
    })
  }

  // Compute the value (size) and cycleness of each node by summing the associated links.
  function computeNodeValues(graph) {
    graph.nodes.forEach(function(node) {
      node.partOfCycle = false
      node.value = Math.max(
        sum(node.sourceLinks, value),
        sum(node.targetLinks, value)
      )
      node.sourceLinks.forEach(function(link) {
        if (link.circular) {
          node.partOfCycle = true
          node.circularLinkType = link.circularLinkType
        }
      })
      node.targetLinks.forEach(function(link) {
        if (link.circular) {
          node.partOfCycle = true
          node.circularLinkType = link.circularLinkType
        }
      })
    })
  }

  function getCircleMargins(graph) {
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

  // Update the x0, y0, x1 and y1 for the sankeyCircular, to allow space for any circular links
  function scaleSankeySize(graph, margin) {
    var maxColumn = max(graph.nodes, function(node) {
      return node.column
    })

    var currentWidth = x1 - x0
    var currentHeight = y1 - y0

    var newWidth = currentWidth + margin.right + margin.left
    var newHeight = currentHeight + margin.top + margin.bottom

    var scaleX = currentWidth / newWidth
    var scaleY = currentHeight / newHeight

    x0 = x0 * scaleX + margin.left
    x1 = margin.right == 0 ? x1 : x1 * scaleX
    y0 = y0 * scaleY + margin.top
    y1 = y1 * scaleY

    graph.nodes.forEach(function(node) {
      node.x0 = x0 + node.column * ((x1 - x0 - dx) / maxColumn)
      node.x1 = node.x0 + dx
    })

    return scaleY
  }

  // Iteratively assign the depth for each node.
  // Nodes are assigned the maximum depth of incoming neighbors plus one;
  // nodes with no incoming links are assigned depth zero, while
  // nodes with no outgoing links are assigned the maximum depth.
  function computeNodeDepths(graph) {
    var nodes, next, x

    for (
      nodes = graph.nodes, next = [], x = 0;
      nodes.length;
      ++x, nodes = next, next = []
    ) {
      nodes.forEach(function(node) {
        node.depth = x
        node.sourceLinks.forEach(function(link) {
          if (next.indexOf(link.target) < 0 && !link.circular) {
            next.push(link.target)
          }
        })
      })
    }

    for (
      nodes = graph.nodes, next = [], x = 0;
      nodes.length;
      ++x, nodes = next, next = []
    ) {
      nodes.forEach(function(node) {
        node.height = x
        node.targetLinks.forEach(function(link) {
          if (next.indexOf(link.source) < 0 && !link.circular) {
            next.push(link.source)
          }
        })
      })
    }

    // assign column numbers, and get max value
    graph.nodes.forEach(function(node) {
      node.column = Math.floor(align.call(null, node, x))
    })
  }

  // Assign nodes' breadths, and then shift nodes that overlap (resolveCollisions)
  function computeNodeBreadths(graph, iterations, id) {
    var columns = nest()
      .key(function(d) {
        return d.column
      })
      .sortKeys(ascending)
      .entries(graph.nodes)
      .map(function(d) {
        return d.values
      })

    initializeNodeBreadth(id)
    resolveCollisions()

    for (var alpha = 1, n = iterations; n > 0; --n) {
      relaxLeftAndRight((alpha *= 0.99), id)
      resolveCollisions()
    }

    function initializeNodeBreadth(id) {
      //override py if nodePadding has been set
      if (paddingRatio) {
        var padding = Infinity
        columns.forEach(function(nodes) {
          var thisPadding = y1 * paddingRatio / (nodes.length + 1)
          padding = thisPadding < padding ? thisPadding : padding
        })
        py = padding
      }

      var ky = min(columns, function(nodes) {
        return (y1 - y0 - (nodes.length - 1) * py) / sum(nodes, value)
      })

      //calculate the widths of the links
      ky = ky * scale

      graph.links.forEach(function(link) {
        link.width = link.value * ky
      })

      //determine how much to scale down the chart, based on circular links
      var margin = getCircleMargins(graph)
      var ratio = scaleSankeySize(graph, margin)

      //re-calculate widths
      ky = ky * ratio

      graph.links.forEach(function(link) {
        link.width = link.value * ky
      })

      columns.forEach(function(nodes) {
        var nodesLength = nodes.length
        nodes.forEach(function(node, i) {
          if (node.depth == columns.length - 1 && nodesLength == 1) {
            node.y0 = y1 / 2 - node.value * ky
            node.y1 = node.y0 + node.value * ky
          } else if (node.depth == 0 && nodesLength == 1) {
            node.y0 = y1 / 2 - node.value * ky
            node.y1 = node.y0 + node.value * ky
          } else if (node.partOfCycle) {
            if (numberOfNonSelfLinkingCycles(node, id) == 0) {
              node.y0 = y1 / 2 + i
              node.y1 = node.y0 + node.value * ky
            } else if (node.circularLinkType == 'top') {
              node.y0 = y0 + i
              node.y1 = node.y0 + node.value * ky
            } else {
              node.y0 = y1 - node.value * ky - i
              node.y1 = node.y0 + node.value * ky
            }
          } else {
            if (margin.top == 0 || margin.bottom == 0) {
              node.y0 = (y1 - y0) / nodesLength * i
              node.y1 = node.y0 + node.value * ky
            } else {
              node.y0 = (y1 - y0) / 2 - nodesLength / 2 + i
              node.y1 = node.y0 + node.value * ky
            }
          }
        })
      })
    }

    // For each node in each column, check the node's vertical position in relation to its targets and sources vertical position
    // and shift up/down to be closer to the vertical middle of those targets and sources
    function relaxLeftAndRight(alpha, id) {
      var columnsLength = columns.length

      columns.forEach(function(nodes, i) {
        var n = nodes.length
        var depth = nodes[0].depth

        nodes.forEach(function(node) {
          // check the node is not an orphan
          if (node.sourceLinks.length || node.targetLinks.length) {
            if (
              node.partOfCycle &&
              numberOfNonSelfLinkingCycles(node, id) > 0
            ) {
            } else if (depth == 0 && n == 1) {
              var nodeHeight = node.y1 - node.y0

              node.y0 = y1 / 2 - nodeHeight / 2
              node.y1 = y1 / 2 + nodeHeight / 2
            } else if (depth == columnsLength - 1 && n == 1) {
              var nodeHeight = node.y1 - node.y0

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

    // For each column, check if nodes are overlapping, and if so, shift up/down
    function resolveCollisions() {
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
          ;(y = node.y0 -= dy), (node.y1 -= dy)

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
  }

  // Assign the links y0 and y1 based on source/target nodes position,
  // plus the link's relative position to other links to the same node
  function computeLinkBreadths(graph) {
    graph.nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetBreadth)
      node.targetLinks.sort(ascendingSourceBreadth)
    })
    graph.nodes.forEach(function(node) {
      var y0 = node.y0
      var y1 = y0

      // start from the bottom of the node for cycle links
      var y0cycle = node.y1
      var y1cycle = y0cycle

      node.sourceLinks.forEach(function(link) {
        if (link.circular) {
          link.y0 = y0cycle - link.width / 2
          y0cycle = y0cycle - link.width
        } else {
          link.y0 = y0 + link.width / 2
          y0 += link.width
        }
      })
      node.targetLinks.forEach(function(link) {
        if (link.circular) {
          link.y1 = y1cycle - link.width / 2
          y1cycle = y1cycle - link.width
        } else {
          link.y1 = y1 + link.width / 2
          y1 += link.width
        }
      })
    })
  }

  return sankeyCircular
}

/// /////////////////////////////////////////////////////////////////////////////////
// Cycle functions
// portion of code to detect circular links based on Colin Fergus' bl.ock https://gist.github.com/cfergus/3956043

// Identify circles in the link objects
function identifyCircles(graph, id) {
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

// Assign a circular link type (top or bottom), based on:
// - if the source/target node already has circular links, then use the same type
// - if not, choose the type with fewer links
function selectCircularLinkTypes(graph, id) {
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

// Checks if link creates a cycle
function createsCycle(originalSource, nodeToCheck, graph, id) {
  // Check for self linking nodes
  if (getNodeID(originalSource, id) == getNodeID(nodeToCheck, id)) {
    return true
  }

  if (graph.length == 0) {
    return false
  }

  var nextLinks = findLinksOutward(nodeToCheck, graph)
  // leaf node check
  if (nextLinks.length == 0) {
    return false
  }

  // cycle check
  for (var i = 0; i < nextLinks.length; i++) {
    var nextLink = nextLinks[i]

    if (nextLink.target === originalSource) {
      return true
    }

    // Recurse
    if (createsCycle(originalSource, nextLink.target, graph, id)) {
      return true
    }
  }

  // Exhausted all links
  return false
}

// Return the number of circular links for node, not including self linking links
function numberOfNonSelfLinkingCycles(node, id) {
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

// Check if a circular link is the only circular link for both its source and target node
function onlyCircularLink(link) {
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

// Return the Y coordinate on the longerLink path * which is perpendicular shorterLink's source.
// * approx, based on a straight line from target to source, when in fact the path is a bezier
function linkPerpendicularYToLinkTarget(longerLink, shorterLink) {
  // get the angle for the longer link
  var angle = linkAngle(longerLink)

  // get the adjacent length to the other link's x position
  var heightFromY1ToPependicular = linkXLength(shorterLink) / Math.tan(angle)

  // add or subtract from longer link's original y1, depending on the slope
  var yPerpendicular =
    incline(longerLink) == 'up'
      ? longerLink.y1 - heightFromY1ToPependicular
      : longerLink.y1 + heightFromY1ToPependicular

  return yPerpendicular
}

// Move any nodes that overlap links which span 2+ columns
function resolveNodeLinkOverlaps(graph, y0, y1, id) {
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

// sort and set the links' y0 for each node
function sortSourceLinks(graph, y1, id) {
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

/// ////////////////////////////////////////////////////////////////////////////

/*exports.sankeyCircular = sankeyCircular
  exports.sankeyCenter = center
  exports.sankeyLeft = left
  exports.sankeyRight = right
  exports.sankeyJustify = justify

  Object.defineProperty(exports, '__esModule', { value: true })*/
