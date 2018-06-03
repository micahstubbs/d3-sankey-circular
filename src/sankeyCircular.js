// https://github.com/tomshanley/d3-sankeyCircular-circular
// fork of https://github.com/d3/d3-sankeyCircular copyright Mike Bostock
// external imports
import { ascending } from 'd3-array'
import { nest } from 'd3-collection'

// project imports
import constant from './constant'
import { justify } from './align'
import fillHeight from './fillHeight'
import sortTargetLinks from './sortTargetLinks'
import addCircularPathData from './addCircularPathData'
import ascendingBreadth from './ascendingBreadth'
import sortSourceLinks from './sortSourceLinks'
import resolveNodeLinkOverlaps from './resolveNodeLinkOverlaps'
import selectCircularLinkTypes from './selectCircularLinkTypes'
import identifyCircles from './identifyCircles'
import computeNodeLinks from './computeNodeLinks'
import computeNodeValues from './computeNodeValues'
import computeNodeDepths from './computeNodeDepths'

import resolveCollisions from './resolveCollisions'
import relaxLeftAndRight from './relaxLeftAndRight'
import initializeNodeBreadth from './initializeNodeBreadth'

// sort links' breadth (ie top to bottom in a column),
// based on their source nodes' breadths
function ascendingSourceBreadth(a, b) {
  return ascendingBreadth(a.source, b.source) || a.index - b.index
}

// sort links' breadth (ie top to bottom in a column),
// based on their target nodes' breadths
function ascendingTargetBreadth(a, b) {
  return ascendingBreadth(a.target, b.target) || a.index - b.index
}

// return the value of a node or link
function value(d) {
  return d.value
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

// The main sankeyCircular functions

// Some constants for circular link calculations
var verticalMargin = 25
var baseRadius = 10

//Possibly let user control this,
// although anything over 0.5 starts to get too cramped
var scale = 0.3

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
    let graph = {
      nodes: nodes.apply(null, arguments),
      links: links.apply(null, arguments)
    }

    // Process the graph's nodes and links, setting their positions

    // 1.  Associate the nodes with their respective links, and vice versa
    graph = computeNodeLinks(graph, id)

    // 2.  Determine which links result in a circular path in the graph
    graph = identifyCircles(graph, id)

    // 4. Calculate the nodes' values, based on the values
    // of the incoming and outgoing links
    graph = computeNodeValues(graph, value)

    // 5.  Calculate the nodes' depth based on the incoming and outgoing links
    //     Sets the nodes':
    //     - depth:  the depth in the graph
    //     - column: the depth (0, 1, 2, etc), as is relates to visual position from left to right
    //     - x0, x1: the x coordinates, as is relates to visual position from left to right
    graph = computeNodeDepths(graph, align)

    // 3.  Determine how the circular links will be drawn,
    //     either travelling back above the main chart ("top")
    //     or below the main chart ("bottom")
    graph = selectCircularLinkTypes(graph, id)

    // 6.  Calculate the nodes' and links' vertical position within their respective column
    //     Also readjusts sankeyCircular size if circular links are needed, and node x's
    computeNodeBreadths(graph, iterations, id)
    computeLinkBreadths(graph)

    // 7.  Sort links per node, based on the links' source/target nodes' breadths
    // 8.  Adjust nodes that overlap links that span 2+ columns

    //Possibly let user control this number, like the iterations over node placement
    var linkSortingIterations = 4
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
  // nodeID, nodeAlign, nodeWidth, nodePadding, nodes, links, size, extent,
  // iterations, nodePaddingRatio, circularLinkGap
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

    const initializeNodeBreadthResult = initializeNodeBreadth(
      id,
      scale,
      paddingRatio,
      columns,
      x0,
      x1,
      y0,
      y1,
      dx,
      py,
      value,
      graph,
      verticalMargin,
      baseRadius
    )
    py = initializeNodeBreadthResult.newPy
    columns = initializeNodeBreadthResult.columns
    graph = initializeNodeBreadthResult.graph
    x0 = initializeNodeBreadthResult.newX0
    x1 = initializeNodeBreadthResult.newX1
    y0 = initializeNodeBreadthResult.newY0
    y1 = initializeNodeBreadthResult.newY1
    dx = initializeNodeBreadthResult.newDx

    resolveCollisions(columns, y0, y1, py)

    for (var alpha = 1, n = iterations; n > 0; --n) {
      relaxLeftAndRight((alpha *= 0.99), id, columns, y1)
      resolveCollisions(columns, y0, y1, py)
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
// portion of code to detect circular links based on Colin Fergus'
// bl.ock https://gist.github.com/cfergus/3956043

/// ////////////////////////////////////////////////////////////////////////////

/*exports.sankeyCircular = sankeyCircular
  exports.sankeyCenter = center
  exports.sankeyLeft = left
  exports.sankeyRight = right
  exports.sankeyJustify = justify

  Object.defineProperty(exports, '__esModule', { value: true })*/
