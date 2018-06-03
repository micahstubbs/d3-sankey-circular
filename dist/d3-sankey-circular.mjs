import { min, max, sum, mean, ascending } from 'd3-array';
import { linkHorizontal } from 'd3-shape';
import { map, nest } from 'd3-collection';

// returns a function, using the parameter given to the sankey setting
function constant(x) {
  return function () {
    return x;
  };
}

// For a given link, return the target node's depth
function targetDepth(d) {
  return d.target.depth;
}

// The depth of a node when the nodeAlign (align) is set to 'left'
function left(node) {
  return node.depth;
}

// The depth of a node when the nodeAlign (align) is set to 'right'
function right(node, n) {
  return n - 1 - node.height;
}

// The depth of a node when the nodeAlign (align) is set to 'justify'
function justify(node, n) {
  return node.sourceLinks.length ? node.depth : n - 1;
}

// The depth of a node when the nodeAlign (align) is set to 'center'
function center(node) {
  return node.targetLinks.length ? node.depth : node.sourceLinks.length ? min(node.sourceLinks, targetDepth) - 1 : 0;
}

function fillHeight(graph, y0, y1) {
  var nodes = graph.nodes;
  var links = graph.links;

  var top = false;
  var bottom = false;

  links.forEach(function (link) {
    if (link.circularLinkType == 'top') {
      top = true;
    } else if (link.circularLinkType == 'bottom') {
      bottom = true;
    }
  });

  if (top == false || bottom == false) {
    var minY0 = min(nodes, function (node) {
      return node.y0;
    });
    var maxY1 = max(nodes, function (node) {
      return node.y1;
    });
    var currentHeight = maxY1 - minY0;
    var chartHeight = y1 - y0;
    var ratio = chartHeight / currentHeight;

    nodes.forEach(function (node) {
      var nodeHeight = (node.y1 - node.y0) * ratio;
      node.y0 = (node.y0 - minY0) * ratio;
      node.y1 = node.y0 + nodeHeight;
    });

    links.forEach(function (link) {
      link.y0 = (link.y0 - minY0) * ratio;
      link.y1 = (link.y1 - minY0) * ratio;
      link.width = link.width * ratio;
    });
  }
}

function getNodeID(node, id) {
  return id(node);
}

// returns the slope of a link, from source to target
// up => slopes up from source to target
// down => slopes down from source to target
function incline(link) {
  return link.y0 - link.y1 > 0 ? 'up' : 'down';
}

// test if links both slope up, or both slope down
function sameInclines(link1, link2) {
  return incline(link1) == incline(link2);
}

// Return the angle between a straight line between
// the source and target of the link,
// and the vertical plane of the node
function linkAngle(link) {
  var adjacent = Math.abs(link.y1 - link.y0);
  var opposite = Math.abs(link.target.x0 - link.source.x1);

  return Math.atan(opposite / adjacent);
}

// return the distance between the link's target and source node, in terms of the nodes' X coordinate
function linkXLength(link) {
  return link.target.x0 - link.source.x1;
}

// Return the Y coordinate on the longerLink path * which is perpendicular shorterLink's source.
// * approx, based on a straight line from target to source, when in fact the path is a bezier
function linkPerpendicularYToLinkSource(longerLink, shorterLink) {
  // get the angle for the longer link
  var angle = linkAngle(longerLink);

  // get the adjacent length to the other link's x position
  var heightFromY1ToPependicular = linkXLength(shorterLink) / Math.tan(angle);

  // add or subtract from longer link1's original y1, depending on the slope
  var yPerpendicular = incline(longerLink) == 'up' ? longerLink.y1 + heightFromY1ToPependicular : longerLink.y1 - heightFromY1ToPependicular;

  return yPerpendicular;
}

// sort and set the links' y1 for each node
function sortTargetLinks(graph, y1, id) {
  graph.nodes.forEach(function (node) {
    var nodesTargetLinks = graph.links.filter(function (l) {
      return getNodeID(l.target, id) == getNodeID(node, id);
    });

    var nodesTargetLinksLength = nodesTargetLinks.length;

    if (nodesTargetLinksLength > 1) {
      nodesTargetLinks.sort(function (link1, link2) {
        // if both are not circular, the base on the source y position
        if (!link1.circular && !link2.circular) {
          if (link1.source.column == link2.source.column) {
            return link1.y0 - link2.y0;
          } else if (!sameInclines(link1, link2)) {
            return link1.y0 - link2.y0;
          } else {
            // get the angle of the link to the further source node (ie the smaller column)
            if (link2.source.column < link1.source.column) {
              var link2Adj = linkPerpendicularYToLinkSource(link2, link1);

              return link1.y0 - link2Adj;
            }
            if (link1.source.column < link2.source.column) {
              var link1Adj = linkPerpendicularYToLinkSource(link1, link2);

              return link1Adj - link2.y0;
            }
          }
        }

        // if only one is circular, the move top links up, or bottom links down
        if (link1.circular && !link2.circular) {
          return link1.circularLinkType == 'top' ? -1 : 1;
        } else if (link2.circular && !link1.circular) {
          return link2.circularLinkType == 'top' ? 1 : -1;
        }

        // if both links are circular...
        if (link1.circular && link2.circular) {
          // ...and they both loop the same way (both top)
          if (link1.circularLinkType === link2.circularLinkType && link1.circularLinkType == 'top') {
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.source.column === link2.source.column) {
              return link1.source.y1 - link2.source.y1;
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link1.source.column - link2.source.column;
            }
          } else if (link1.circularLinkType === link2.circularLinkType && link1.circularLinkType == 'bottom') {
            // ...and they both loop the same way (both bottom)
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.source.column === link2.source.column) {
              return link1.source.y1 - link2.source.y1;
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link2.source.column - link1.source.column;
            }
          } else {
            // ...and they loop around different ways, the move top up and bottom down
            return link1.circularLinkType == 'top' ? -1 : 1;
          }
        }
      });
    }

    // update y1 for links
    var yTargetOffset = node.y0;

    nodesTargetLinks.forEach(function (link) {
      link.y1 = yTargetOffset + link.width / 2;
      yTargetOffset = yTargetOffset + link.width;
    });

    // correct any circular bottom links so they are at the bottom of the node
    nodesTargetLinks.forEach(function (link, i) {
      if (link.circularLinkType == 'bottom') {
        var j = i + 1;
        var offsetFromBottom = 0;
        // sum the widths of any links that are below this link
        for (j; j < nodesTargetLinksLength; j++) {
          offsetFromBottom = offsetFromBottom + nodesTargetLinks[j].width;
        }
        link.y1 = node.y1 - offsetFromBottom - link.width / 2;
      }
    });
  });
}

// return the distance between the link's target and source node,
// in terms of the nodes' column
function linkColumnDistance(link) {
  return link.target.column - link.source.column;
}

// sort descending links by their source vertical position, y0
function sortLinkSourceYDescending(link1, link2) {
  return link2.y0 - link1.y0;
}

// sort ascending links by their source vertical position, y0
function sortLinkSourceYAscending(link1, link2) {
  return link1.y0 - link2.y0;
}

// sort links based on the distance between the source and tartget node columns
// if the same, then use Y position of the source node
function sortLinkColumnAscending(link1, link2) {
  if (linkColumnDistance(link1) == linkColumnDistance(link2)) {
    return link1.circularLinkType == 'bottom' ? sortLinkSourceYDescending(link1, link2) : sortLinkSourceYAscending(link1, link2);
  } else {
    return linkColumnDistance(link2) - linkColumnDistance(link1);
  }
}

// check if link is self linking, ie links a node to the same node
function selfLinking(link, id) {
  return getNodeID(link.source, id) == getNodeID(link.target, id);
}

// Check if two circular links potentially overlap
function circularLinksCross(link1, link2) {
  if (link1.source.column < link2.target.column) {
    return false;
  } else if (link1.target.column > link2.source.column) {
    return false;
  } else {
    return true;
  }
}

// Check if a circular link is the only circular link for both its source and target node
function onlyCircularLink(link) {
  var nodeSourceLinks = link.source.sourceLinks;
  var sourceCount = 0;
  nodeSourceLinks.forEach(function (l) {
    sourceCount = l.circular ? sourceCount + 1 : sourceCount;
  });

  var nodeTargetLinks = link.target.targetLinks;
  var targetCount = 0;
  nodeTargetLinks.forEach(function (l) {
    targetCount = l.circular ? targetCount + 1 : targetCount;
  });

  if (sourceCount > 1 || targetCount > 1) {
    return false;
  } else {
    return true;
  }
}

// creates vertical buffer values per set of top/bottom links
function calcVerticalBuffer(links, circularLinkGap, id) {
  links.sort(sortLinkColumnAscending);
  links.forEach(function (link, i) {
    var buffer = 0;

    if (selfLinking(link, id) && onlyCircularLink(link)) {
      link.circularPathData.verticalBuffer = buffer + link.width / 2;
    } else {
      var j = 0;
      for (j; j < i; j++) {
        if (circularLinksCross(links[i], links[j])) {
          var bufferOverThisLink = links[j].circularPathData.verticalBuffer + links[j].width / 2 + circularLinkGap;
          buffer = bufferOverThisLink > buffer ? bufferOverThisLink : buffer;
        }
      }

      link.circularPathData.verticalBuffer = buffer + link.width / 2;
    }
  });

  return links;
}

// sort descending links by their target vertical position, y1
function sortLinkTargetYDescending(link1, link2) {
  return link2.y1 - link1.y1;
}

// create a d path using the circularPathData
function createCircularPathString(link) {
      var pathString = '';

      if (link.circularLinkType == 'top') {
            pathString =
            // start at the right of the source node
            'M' + link.circularPathData.sourceX + ' ' + link.circularPathData.sourceY + ' ' +
            // line right to buffer point
            'L' + link.circularPathData.leftInnerExtent + ' ' + link.circularPathData.sourceY + ' ' +
            // Arc around: Centre of arc X and  //Centre of arc Y
            'A' + link.circularPathData.leftLargeArcRadius + ' ' + link.circularPathData.leftSmallArcRadius + ' 0 0 0 ' +
            // End of arc X //End of arc Y
            link.circularPathData.leftFullExtent + ' ' + (link.circularPathData.sourceY - link.circularPathData.leftSmallArcRadius) + ' ' + // End of arc X
            // line up to buffer point
            'L' + link.circularPathData.leftFullExtent + ' ' + link.circularPathData.verticalLeftInnerExtent + ' ' +
            // Arc around: Centre of arc X and  //Centre of arc Y
            'A' + link.circularPathData.leftLargeArcRadius + ' ' + link.circularPathData.leftLargeArcRadius + ' 0 0 0 ' +
            // End of arc X //End of arc Y
            link.circularPathData.leftInnerExtent + ' ' + link.circularPathData.verticalFullExtent + ' ' + // End of arc X
            // line left to buffer point
            'L' + link.circularPathData.rightInnerExtent + ' ' + link.circularPathData.verticalFullExtent + ' ' +
            // Arc around: Centre of arc X and  //Centre of arc Y
            'A' + link.circularPathData.rightLargeArcRadius + ' ' + link.circularPathData.rightLargeArcRadius + ' 0 0 0 ' +
            // End of arc X //End of arc Y
            link.circularPathData.rightFullExtent + ' ' + link.circularPathData.verticalRightInnerExtent + ' ' + // End of arc X
            // line down
            'L' + link.circularPathData.rightFullExtent + ' ' + (link.circularPathData.targetY - link.circularPathData.rightSmallArcRadius) + ' ' +
            // Arc around: Centre of arc X and  //Centre of arc Y
            'A' + link.circularPathData.rightLargeArcRadius + ' ' + link.circularPathData.rightSmallArcRadius + ' 0 0 0 ' +
            // End of arc X //End of arc Y
            link.circularPathData.rightInnerExtent + ' ' + link.circularPathData.targetY + ' ' + // End of arc X
            // line to end
            'L' + link.circularPathData.targetX + ' ' + link.circularPathData.targetY;
      } else {
            // bottom path
            pathString =
            // start at the right of the source node
            'M' + link.circularPathData.sourceX + ' ' + link.circularPathData.sourceY + ' ' +
            // line right to buffer point
            'L' + link.circularPathData.leftInnerExtent + ' ' + link.circularPathData.sourceY + ' ' +
            // Arc around: Centre of arc X and  //Centre of arc Y
            'A' + link.circularPathData.leftLargeArcRadius + ' ' + link.circularPathData.leftSmallArcRadius + ' 0 0 1 ' +
            // End of arc X //End of arc Y
            link.circularPathData.leftFullExtent + ' ' + (link.circularPathData.sourceY + link.circularPathData.leftSmallArcRadius) + ' ' + // End of arc X
            // line down to buffer point
            'L' + link.circularPathData.leftFullExtent + ' ' + link.circularPathData.verticalLeftInnerExtent + ' ' +
            // Arc around: Centre of arc X and  //Centre of arc Y
            'A' + link.circularPathData.leftLargeArcRadius + ' ' + link.circularPathData.leftLargeArcRadius + ' 0 0 1 ' +
            // End of arc X //End of arc Y
            link.circularPathData.leftInnerExtent + ' ' + link.circularPathData.verticalFullExtent + ' ' + // End of arc X
            // line left to buffer point
            'L' + link.circularPathData.rightInnerExtent + ' ' + link.circularPathData.verticalFullExtent + ' ' +
            // Arc around: Centre of arc X and  //Centre of arc Y
            'A' + link.circularPathData.rightLargeArcRadius + ' ' + link.circularPathData.rightLargeArcRadius + ' 0 0 1 ' +
            // End of arc X //End of arc Y
            link.circularPathData.rightFullExtent + ' ' + link.circularPathData.verticalRightInnerExtent + ' ' + // End of arc X
            // line up
            'L' + link.circularPathData.rightFullExtent + ' ' + (link.circularPathData.targetY + link.circularPathData.rightSmallArcRadius) + ' ' +
            // Arc around: Centre of arc X and  //Centre of arc Y
            'A' + link.circularPathData.rightLargeArcRadius + ' ' + link.circularPathData.rightSmallArcRadius + ' 0 0 1 ' +
            // End of arc X //End of arc Y
            link.circularPathData.rightInnerExtent + ' ' + link.circularPathData.targetY + ' ' + // End of arc X
            // line to end
            'L' + link.circularPathData.targetX + ' ' + link.circularPathData.targetY;
      }

      return pathString;
}

// sort ascending links by their target vertical position, y1
function sortLinkTargetYAscending(link1, link2) {
  return link1.y1 - link2.y1;
}

// calculate the optimum path for a link to reduce overlaps
function addCircularPathData(graph, circularLinkGap, y1, id, baseRadius, verticalMargin) {
  //var baseRadius = 10
  var buffer = 5;
  //var verticalMargin = 25

  var minY = min(graph.links, function (link) {
    return link.source.y0;
  });

  // create object for circular Path Data
  graph.links.forEach(function (link) {
    if (link.circular) {
      link.circularPathData = {};
    }
  });

  // calc vertical offsets per top/bottom links
  var topLinks = graph.links.filter(function (l) {
    return l.circularLinkType == 'top';
  });
  /* topLinks = */calcVerticalBuffer(topLinks, circularLinkGap, id);

  var bottomLinks = graph.links.filter(function (l) {
    return l.circularLinkType == 'bottom';
  });
  /* bottomLinks = */calcVerticalBuffer(bottomLinks, circularLinkGap, id);

  // add the base data for each link
  graph.links.forEach(function (link) {
    if (link.circular) {
      link.circularPathData.arcRadius = link.width + baseRadius;
      link.circularPathData.leftNodeBuffer = buffer;
      link.circularPathData.rightNodeBuffer = buffer;
      link.circularPathData.sourceWidth = link.source.x1 - link.source.x0;
      link.circularPathData.sourceX = link.source.x0 + link.circularPathData.sourceWidth;
      link.circularPathData.targetX = link.target.x0;
      link.circularPathData.sourceY = link.y0;
      link.circularPathData.targetY = link.y1;

      // for self linking paths, and that the only circular link in/out of that node
      if (selfLinking(link, id) && onlyCircularLink(link)) {
        link.circularPathData.leftSmallArcRadius = baseRadius + link.width / 2;
        link.circularPathData.leftLargeArcRadius = baseRadius + link.width / 2;
        link.circularPathData.rightSmallArcRadius = baseRadius + link.width / 2;
        link.circularPathData.rightLargeArcRadius = baseRadius + link.width / 2;

        if (link.circularLinkType == 'bottom') {
          link.circularPathData.verticalFullExtent = link.source.y1 + verticalMargin + link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent = link.circularPathData.verticalFullExtent - link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent = link.circularPathData.verticalFullExtent - link.circularPathData.rightLargeArcRadius;
        } else {
          // top links
          link.circularPathData.verticalFullExtent = link.source.y0 - verticalMargin - link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent = link.circularPathData.verticalFullExtent + link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent = link.circularPathData.verticalFullExtent + link.circularPathData.rightLargeArcRadius;
        }
      } else {
        // else calculate normally
        // add left extent coordinates, based on links with same source column and circularLink type
        var thisColumn = link.source.column;
        var thisCircularLinkType = link.circularLinkType;
        var sameColumnLinks = graph.links.filter(function (l) {
          return l.source.column == thisColumn && l.circularLinkType == thisCircularLinkType;
        });

        if (link.circularLinkType == 'bottom') {
          sameColumnLinks.sort(sortLinkSourceYDescending);
        } else {
          sameColumnLinks.sort(sortLinkSourceYAscending);
        }

        var radiusOffset = 0;
        sameColumnLinks.forEach(function (l, i) {
          if (l.circularLinkID == link.circularLinkID) {
            link.circularPathData.leftSmallArcRadius = baseRadius + link.width / 2 + radiusOffset;
            link.circularPathData.leftLargeArcRadius = baseRadius + link.width / 2 + i * circularLinkGap + radiusOffset;
          }
          radiusOffset = radiusOffset + l.width;
        });

        // add right extent coordinates, based on links with same target column and circularLink type
        thisColumn = link.target.column;
        sameColumnLinks = graph.links.filter(function (l) {
          return l.target.column == thisColumn && l.circularLinkType == thisCircularLinkType;
        });
        if (link.circularLinkType == 'bottom') {
          sameColumnLinks.sort(sortLinkTargetYDescending);
        } else {
          sameColumnLinks.sort(sortLinkTargetYAscending);
        }

        radiusOffset = 0;
        sameColumnLinks.forEach(function (l, i) {
          if (l.circularLinkID == link.circularLinkID) {
            link.circularPathData.rightSmallArcRadius = baseRadius + link.width / 2 + radiusOffset;
            link.circularPathData.rightLargeArcRadius = baseRadius + link.width / 2 + i * circularLinkGap + radiusOffset;
          }
          radiusOffset = radiusOffset + l.width;
        });

        // bottom links
        if (link.circularLinkType == 'bottom') {
          link.circularPathData.verticalFullExtent = y1 + verticalMargin + link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent = link.circularPathData.verticalFullExtent - link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent = link.circularPathData.verticalFullExtent - link.circularPathData.rightLargeArcRadius;
        } else {
          // top links
          link.circularPathData.verticalFullExtent = minY - verticalMargin - link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent = link.circularPathData.verticalFullExtent + link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent = link.circularPathData.verticalFullExtent + link.circularPathData.rightLargeArcRadius;
        }
      }

      // all links
      link.circularPathData.leftInnerExtent = link.circularPathData.sourceX + link.circularPathData.leftNodeBuffer;
      link.circularPathData.rightInnerExtent = link.circularPathData.targetX - link.circularPathData.rightNodeBuffer;
      link.circularPathData.leftFullExtent = link.circularPathData.sourceX + link.circularPathData.leftLargeArcRadius + link.circularPathData.leftNodeBuffer;
      link.circularPathData.rightFullExtent = link.circularPathData.targetX - link.circularPathData.rightLargeArcRadius - link.circularPathData.rightNodeBuffer;
    }

    if (link.circular) {
      link.path = createCircularPathString(link);
    } else {
      var normalPath = linkHorizontal().source(function (d) {
        var x = d.source.x0 + (d.source.x1 - d.source.x0);
        var y = d.y0;
        return [x, y];
      }).target(function (d) {
        var x = d.target.x0;
        var y = d.y1;
        return [x, y];
      });
      link.path = normalPath(link);
    }
  });
}

// Return the Y coordinate on the longerLink path *
// which is perpendicular shorterLink's source.
//
// * approx, based on a straight line from target to source,
// when in fact the path is a bezier
function linkPerpendicularYToLinkTarget(longerLink, shorterLink) {
  // get the angle for the longer link
  var angle = linkAngle(longerLink);

  // get the adjacent length to the other link's x position
  var heightFromY1ToPependicular = linkXLength(shorterLink) / Math.tan(angle);

  // add or subtract from longer link's original y1, depending on the slope
  var yPerpendicular = incline(longerLink) == 'up' ? longerLink.y1 - heightFromY1ToPependicular : longerLink.y1 + heightFromY1ToPependicular;

  return yPerpendicular;
}

// sort and set the links' y0 for each node
function sortSourceLinks(graph, y1, id) {
  graph.nodes.forEach(function (node) {
    // move any nodes up which are off the bottom
    if (node.y + (node.y1 - node.y0) > y1) {
      node.y = node.y - (node.y + (node.y1 - node.y0) - y1);
    }

    var nodesSourceLinks = graph.links.filter(function (l) {
      return getNodeID(l.source, id) == getNodeID(node, id);
    });

    var nodeSourceLinksLength = nodesSourceLinks.length;

    // if more than 1 link then sort
    if (nodeSourceLinksLength > 1) {
      nodesSourceLinks.sort(function (link1, link2) {
        // if both are not circular...
        if (!link1.circular && !link2.circular) {
          // if the target nodes are the same column, then sort by the link's target y
          if (link1.target.column == link2.target.column) {
            return link1.y1 - link2.y1;
          } else if (!sameInclines(link1, link2)) {
            // if the links slope in different directions, then sort by the link's target y
            return link1.y1 - link2.y1;

            // if the links slope in same directions, then sort by any overlap
          } else {
            if (link1.target.column > link2.target.column) {
              var link2Adj = linkPerpendicularYToLinkTarget(link2, link1);
              return link1.y1 - link2Adj;
            }
            if (link2.target.column > link1.target.column) {
              var link1Adj = linkPerpendicularYToLinkTarget(link1, link2);
              return link1Adj - link2.y1;
            }
          }
        }

        // if only one is circular, the move top links up, or bottom links down
        if (link1.circular && !link2.circular) {
          return link1.circularLinkType == 'top' ? -1 : 1;
        } else if (link2.circular && !link1.circular) {
          return link2.circularLinkType == 'top' ? 1 : -1;
        }

        // if both links are circular...
        if (link1.circular && link2.circular) {
          // ...and they both loop the same way (both top)
          if (link1.circularLinkType === link2.circularLinkType && link1.circularLinkType == 'top') {
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.target.column === link2.target.column) {
              return link1.target.y1 - link2.target.y1;
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link2.target.column - link1.target.column;
            }
          } else if (link1.circularLinkType === link2.circularLinkType && link1.circularLinkType == 'bottom') {
            // ...and they both loop the same way (both bottom)
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.target.column === link2.target.column) {
              return link2.target.y1 - link1.target.y1;
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link1.target.column - link2.target.column;
            }
          } else {
            // ...and they loop around different ways, the move top up and bottom down
            return link1.circularLinkType == 'top' ? -1 : 1;
          }
        }
      });
    }

    // update y0 for links
    var ySourceOffset = node.y0;

    nodesSourceLinks.forEach(function (link) {
      link.y0 = ySourceOffset + link.width / 2;
      ySourceOffset = ySourceOffset + link.width;
    });

    // correct any circular bottom links so they are at the bottom of the node
    nodesSourceLinks.forEach(function (link, i) {
      if (link.circularLinkType == 'bottom') {
        var j = i + 1;
        var offsetFromBottom = 0;
        // sum the widths of any links that are below this link
        for (j; j < nodeSourceLinksLength; j++) {
          offsetFromBottom = offsetFromBottom + nodesSourceLinks[j].width;
        }
        link.y0 = node.y1 - offsetFromBottom - link.width / 2;
      }
    });
  });
}

// update a node, and its associated links, vertical positions (y0, y1)
function adjustNodeHeight(node, dy, sankeyY0, sankeyY1) {
  if (node.y0 + dy >= sankeyY0 && node.y1 + dy <= sankeyY1) {
    node.y0 = node.y0 + dy;
    node.y1 = node.y1 + dy;

    node.targetLinks.forEach(function (l) {
      l.y1 = l.y1 + dy;
    });

    node.sourceLinks.forEach(function (l) {
      l.y0 = l.y0 + dy;
    });
  }
  return node;
}

// check if two nodes overlap
function nodesOverlap(nodeA, nodeB) {
  // test if nodeA top partially overlaps nodeB
  if (nodeA.y0 > nodeB.y0 && nodeA.y0 < nodeB.y1) {
    return true;
  } else if (nodeA.y1 > nodeB.y0 && nodeA.y1 < nodeB.y1) {
    // test if nodeA bottom partially overlaps nodeB
    return true;
  } else if (nodeA.y0 < nodeB.y0 && nodeA.y1 > nodeB.y1) {
    // test if nodeA covers nodeB
    return true;
  } else {
    return false;
  }
}

// Move any nodes that overlap links which span 2+ columns
function resolveNodeLinkOverlaps(graph, y0, y1, id) {
  graph.links.forEach(function (link) {
    if (link.circular) {
      return;
    }

    if (link.target.column - link.source.column > 1) {
      var columnToTest = link.source.column + 1;
      var maxColumnToTest = link.target.column - 1;

      var i = 1;
      var numberOfColumnsToTest = maxColumnToTest - columnToTest + 1;

      for (i = 1; columnToTest <= maxColumnToTest; columnToTest++, i++) {
        graph.nodes.forEach(function (node) {
          if (node.column == columnToTest) {
            var t = i / (numberOfColumnsToTest + 1);

            // Find all the points of a cubic bezier curve in javascript
            // https://stackoverflow.com/questions/15397596/find-all-the-points-of-a-cubic-bezier-curve-in-javascript

            var B0_t = Math.pow(1 - t, 3);
            var B1_t = 3 * t * Math.pow(1 - t, 2);
            var B2_t = 3 * Math.pow(t, 2) * (1 - t);
            var B3_t = Math.pow(t, 3);

            var py_t = B0_t * link.y0 + B1_t * link.y0 + B2_t * link.y1 + B3_t * link.y1;

            var linkY0AtColumn = py_t - link.width / 2;
            var linkY1AtColumn = py_t + link.width / 2;

            var dy;

            // If top of link overlaps node, push node up
            if (linkY0AtColumn > node.y0 && linkY0AtColumn < node.y1) {
              dy = node.y1 - linkY0AtColumn + 10;
              dy = node.circularLinkType == 'bottom' ? dy : -dy;

              node = adjustNodeHeight(node, dy, y0, y1);

              // check if other nodes need to move up too
              graph.nodes.forEach(function (otherNode) {
                // don't need to check itself or nodes at different columns
                if (getNodeID(otherNode, id) == getNodeID(node, id) || otherNode.column != node.column) {
                  return;
                }
                if (nodesOverlap(node, otherNode)) {
                  adjustNodeHeight(otherNode, dy, y0, y1);
                }
              });
            } else if (linkY1AtColumn > node.y0 && linkY1AtColumn < node.y1) {
              // If bottom of link overlaps node, push node down
              dy = linkY1AtColumn - node.y0 + 10;

              node = adjustNodeHeight(node, dy, y0, y1);

              // check if other nodes need to move down too
              graph.nodes.forEach(function (otherNode) {
                // don't need to check itself or nodes at different columns
                if (getNodeID(otherNode, id) == getNodeID(node, id) || otherNode.column != node.column) {
                  return;
                }
                if (otherNode.y0 < node.y1 && otherNode.y1 > node.y1) {
                  adjustNodeHeight(otherNode, dy, y0, y1);
                }
              });
            } else if (linkY0AtColumn < node.y0 && linkY1AtColumn > node.y1) {
              // if link completely overlaps node
              dy = linkY1AtColumn - node.y0 + 10;

              node = adjustNodeHeight(node, dy, y0, y1);

              graph.nodes.forEach(function (otherNode) {
                // don't need to check itself or nodes at different columns
                if (getNodeID(otherNode, id) == getNodeID(node, id) || otherNode.column != node.column) {
                  return;
                }
                if (otherNode.y0 < node.y1 && otherNode.y1 > node.y1) {
                  adjustNodeHeight(otherNode, dy, y0, y1);
                }
              });
            }
          }
        });
      }
    }
  });
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && (typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map$$1, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map$$1.set(pair[0], pair[1]);
  return map$$1;
}

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set$$1, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set$$1.add(value);
  return set$$1;
}

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map$$1) {
  var index = -1,
      result = Array(map$$1.size);

  map$$1.forEach(function (value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set$$1) {
  var index = -1,
      result = Array(set$$1.size);

  set$$1.forEach(function (value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    _Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise$1 = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise$1),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    hash: new Hash(),
    map: new (Map || ListCache)(),
    string: new Hash()
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache();
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
    object[key] = value;
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {boolean} [isFull] Specify a clone including symbols.
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || isFunc && !object) {
      if (isHostObject(value)) {
        return object ? value : {};
      }
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack());
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (!isArr) {
    var props = isFull ? getAllKeys(value) : keys(value);
  }
  arrayEach(props || value, function (subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
  });
  return result;
}

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(proto) {
  return isObject(proto) ? objectCreate(proto) : {};
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var result = new buffer.constructor(buffer.length);
  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map$$1, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map$$1), true) : mapToArray(map$$1);
  return arrayReduce(array, addMapEntry, new map$$1.constructor());
}

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set$$1, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set$$1), true) : setToArray(set$$1);
  return arrayReduce(array, addSetEntry, new set$$1.constructor());
}

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Copies own symbol properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map$$1, key) {
  var data = map$$1.__data__;
  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
  getTag = function getTag(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag;
        case mapCtorString:
          return mapTag;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag;
        case weakMapCtorString:
          return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return typeof object.constructor == 'function' && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
}

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag:
    case float64Tag:
    case int8Tag:
    case int16Tag:
    case int32Tag:
    case uint8Tag:
    case uint8ClampedTag:
    case uint16Tag:
    case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return cloneSymbol(object);
  }
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;

  return value === proto;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return func + '';
    } catch (e) {}
  }
  return '';
}

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, true, true);
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || value !== value && other !== other;
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') && (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object';
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

// Assign a circular link type (top or bottom), based on:
// - if the source/target node already has circular links, then use the same type
// - if not, choose the type with fewer links
function selectCircularLinkTypes(inputGraph, id) {
  var graph = cloneDeep(inputGraph);
  var numberOfTops = 0;
  var numberOfBottoms = 0;
  graph.links.forEach(function (link) {
    if (link.circular) {
      // if either souce or target has type already use that
      if (link.source.circularLinkType || link.target.circularLinkType) {
        // default to source type if available
        link.circularLinkType = link.source.circularLinkType ? link.source.circularLinkType : link.target.circularLinkType;
      } else {
        link.circularLinkType = numberOfTops < numberOfBottoms ? 'top' : 'bottom';
      }

      if (link.circularLinkType == 'top') {
        numberOfTops = numberOfTops + 1;
      } else {
        numberOfBottoms = numberOfBottoms + 1;
      }

      graph.nodes.forEach(function (node) {
        if (getNodeID(node, id) == getNodeID(link.source, id) || getNodeID(node, id) == getNodeID(link.target, id)) {
          node.circularLinkType = link.circularLinkType;
        }
      });
    }
  });

  //correct self-linking links to be same direction as node
  graph.links.forEach(function (link) {
    if (link.circular) {
      //if both source and target node are same type, then link should have same type
      if (link.source.circularLinkType == link.target.circularLinkType) {
        link.circularLinkType = link.source.circularLinkType;
      }
      //if link is self-linking, then link should have same type as node
      if (selfLinking(link, id)) {
        link.circularLinkType = link.source.circularLinkType;
      }
    }
  });
  return graph;
}

// Given a node, find all links for which this is a source in the current 'known' graph
function findLinksOutward(node, graph) {
  var children = [];

  for (var i = 0; i < graph.length; i++) {
    if (node == graph[i].source) {
      children.push(graph[i]);
    }
  }

  return children;
}

// Checks if link creates a cycle
function createsCycle(originalSource, nodeToCheck, graph, id) {
  // Check for self linking nodes
  if (getNodeID(originalSource, id) == getNodeID(nodeToCheck, id)) {
    return true;
  }

  if (graph.length == 0) {
    return false;
  }

  var nextLinks = findLinksOutward(nodeToCheck, graph);
  // leaf node check
  if (nextLinks.length == 0) {
    return false;
  }

  // cycle check
  for (var i = 0; i < nextLinks.length; i++) {
    var nextLink = nextLinks[i];

    if (nextLink.target === originalSource) {
      return true;
    }

    // Recurse
    if (createsCycle(originalSource, nextLink.target, graph, id)) {
      return true;
    }
  }

  // Exhausted all links
  return false;
}

// Identify circles in the link objects
function identifyCircles(inputGraph, id) {
  var graph = cloneDeep(inputGraph);
  var addedLinks = [];
  var circularLinkID = 0;
  graph.links.forEach(function (link) {
    if (createsCycle(link.source, link.target, addedLinks, id)) {
      link.circular = true;
      link.circularLinkID = circularLinkID;
      circularLinkID = circularLinkID + 1;
    } else {
      link.circular = false;
      addedLinks.push(link);
    }
  });
  return graph;
}

// Return the node from the collection that matches the provided ID,
// or throw an error if no match
function find(nodeById, id) {
  var node = nodeById.get(id);
  if (!node) throw new Error('missing: ' + id);
  return node;
}

// Populate the sourceLinks and targetLinks for each node.
// Also, if the source and target are not objects, assume they are indices.
function computeNodeLinks(inputGraph, id) {
  var graph = cloneDeep(inputGraph);
  graph.nodes.forEach(function (node, i) {
    node.index = i;
    node.sourceLinks = [];
    node.targetLinks = [];
  });
  var nodeById = map(graph.nodes, id);
  graph.links.forEach(function (link, i) {
    link.index = i;
    var source = link.source;
    var target = link.target;
    if ((typeof source === 'undefined' ? 'undefined' : _typeof(source)) !== 'object') {
      source = link.source = find(nodeById, source);
    }
    if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') {
      target = link.target = find(nodeById, target);
    }
    source.sourceLinks.push(link);
    target.targetLinks.push(link);
  });
  return graph;
}

// Compute the value (size) and cycleness of each node by summing the associated links.
function computeNodeValues(inputGraph, value) {
  var graph = cloneDeep(inputGraph);
  graph.nodes.forEach(function (node) {
    node.partOfCycle = false;
    node.value = Math.max(sum(node.sourceLinks, value), sum(node.targetLinks, value));
    node.sourceLinks.forEach(function (link) {
      if (link.circular) {
        node.partOfCycle = true;
        node.circularLinkType = link.circularLinkType;
      }
    });
    node.targetLinks.forEach(function (link) {
      if (link.circular) {
        node.partOfCycle = true;
        node.circularLinkType = link.circularLinkType;
      }
    });
  });
  return graph;
}

// Iteratively assign the depth for each node.
// Nodes are assigned the maximum depth of incoming neighbors plus one;
// nodes with no incoming links are assigned depth zero, while
// nodes with no outgoing links are assigned the maximum depth.
function computeNodeDepths(inputGraph, align) {
  var graph = cloneDeep(inputGraph);
  var nodes, next, x;

  for (nodes = graph.nodes, next = [], x = 0; nodes.length; ++x, nodes = next, next = []) {
    nodes.forEach(function (node) {
      node.depth = x;
      node.sourceLinks.forEach(function (link) {
        if (next.indexOf(link.target) < 0 && !link.circular) {
          next.push(link.target);
        }
      });
    });
  }

  for (nodes = graph.nodes, next = [], x = 0; nodes.length; ++x, nodes = next, next = []) {
    nodes.forEach(function (node) {
      node.height = x;
      node.targetLinks.forEach(function (link) {
        if (next.indexOf(link.source) < 0 && !link.circular) {
          next.push(link.source);
        }
      });
    });
  }

  // assign column numbers, and get max value
  graph.nodes.forEach(function (node) {
    node.column = Math.floor(align.call(null, node, x));
  });
  return graph;
}

// sort nodes' breadth (ie top to bottom in a column)
// if both nodes have circular links, or both don't have circular links, then sort by the top (y0) of the node
// else push nodes that have top circular links to the top, and nodes that have bottom circular links to the bottom
function ascendingBreadth(a, b) {
  if (a.partOfCycle === b.partOfCycle) {
    return a.y0 - b.y0;
  } else {
    if (a.circularLinkType === 'top' || b.circularLinkType === 'bottom') {
      return -1;
    } else {
      return 1;
    }
  }
}

// sort links' breadth (ie top to bottom in a column),
// based on their source nodes' breadths
function ascendingSourceBreadth(a, b) {
  return ascendingBreadth(a.source, b.source) || a.index - b.index;
}

// sort links' breadth (ie top to bottom in a column),
// based on their target nodes' breadths
function ascendingTargetBreadth(a, b) {
  return ascendingBreadth(a.target, b.target) || a.index - b.index;
}

// Assign the links y0 and y1 based on source/target nodes position,
// plus the link's relative position to other links to the same node
function computeLinkBreadths(graph) {
  graph.nodes.forEach(function (node) {
    node.sourceLinks.sort(ascendingTargetBreadth);
    node.targetLinks.sort(ascendingSourceBreadth);
  });
  graph.nodes.forEach(function (node) {
    var y0 = node.y0;
    var y1 = y0;

    // start from the bottom of the node for cycle links
    var y0cycle = node.y1;
    var y1cycle = y0cycle;

    node.sourceLinks.forEach(function (link) {
      if (link.circular) {
        link.y0 = y0cycle - link.width / 2;
        y0cycle = y0cycle - link.width;
      } else {
        link.y0 = y0 + link.width / 2;
        y0 += link.width;
      }
    });
    node.targetLinks.forEach(function (link) {
      if (link.circular) {
        link.y1 = y1cycle - link.width / 2;
        y1cycle = y1cycle - link.width;
      } else {
        link.y1 = y1 + link.width / 2;
        y1 += link.width;
      }
    });
  });
}

// For each column, check if nodes are overlapping, and if so, shift up/down
function resolveCollisions(columns, y0, y1, py) {
  columns.forEach(function (nodes) {
    var node,
        dy,
        y = y0,
        n = nodes.length,
        i;

    // Push any overlapping nodes down.
    nodes.sort(ascendingBreadth);

    for (i = 0; i < n; ++i) {
      node = nodes[i];
      dy = y - node.y0;

      if (dy > 0) {
        node.y0 += dy;
        node.y1 += dy;
      }
      y = node.y1 + py;
    }

    // If the bottommost node goes outside the bounds, push it back up.
    dy = y - py - y1;
    if (dy > 0) {
      y = node.y0 -= dy, node.y1 -= dy;

      // Push any overlapping nodes back up.
      for (i = n - 2; i >= 0; --i) {
        node = nodes[i];
        dy = node.y1 + py - y;
        if (dy > 0) node.y0 -= dy, node.y1 -= dy;
        y = node.y0;
      }
    }
  });
}

// return the vertical center of a node
function nodeCenter(node) {
  return (node.y0 + node.y1) / 2;
}

// return the vertical center of a link's source node
function linkSourceCenter(link) {
  return nodeCenter(link.source);
}

// return the vertical center of a link's target node
function linkTargetCenter(link) {
  return nodeCenter(link.target);
}

// Return the number of circular links for node, not including self linking links
function numberOfNonSelfLinkingCycles(node, id) {
  var sourceCount = 0;
  node.sourceLinks.forEach(function (l) {
    sourceCount = l.circular && !selfLinking(l, id) ? sourceCount + 1 : sourceCount;
  });

  var targetCount = 0;
  node.targetLinks.forEach(function (l) {
    targetCount = l.circular && !selfLinking(l, id) ? targetCount + 1 : targetCount;
  });

  return sourceCount + targetCount;
}

// For each node in each column,
// check the node's vertical position in relation to
// its target's and source's vertical position
// and shift up/down to be closer to
// the vertical middle of those targets and sources
function relaxLeftAndRight(alpha, id, columns, y1) {
  var columnsLength = columns.length;

  columns.forEach(function (nodes) {
    var n = nodes.length;
    var depth = nodes[0].depth;

    nodes.forEach(function (node) {
      // check the node is not an orphan
      var nodeHeight;
      if (node.sourceLinks.length || node.targetLinks.length) {
        if (node.partOfCycle && numberOfNonSelfLinkingCycles(node, id) > 0) ; else if (depth == 0 && n == 1) {
          nodeHeight = node.y1 - node.y0;

          node.y0 = y1 / 2 - nodeHeight / 2;
          node.y1 = y1 / 2 + nodeHeight / 2;
        } else if (depth == columnsLength - 1 && n == 1) {
          nodeHeight = node.y1 - node.y0;

          node.y0 = y1 / 2 - nodeHeight / 2;
          node.y1 = y1 / 2 + nodeHeight / 2;
        } else {
          var avg = 0;

          var avgTargetY = mean(node.sourceLinks, linkTargetCenter);
          var avgSourceY = mean(node.targetLinks, linkSourceCenter);

          if (avgTargetY && avgSourceY) {
            avg = (avgTargetY + avgSourceY) / 2;
          } else {
            avg = avgTargetY || avgSourceY;
          }

          var dy = (avg - nodeCenter(node)) * alpha;
          // positive if it node needs to move down
          node.y0 += dy;
          node.y1 += dy;
        }
      }
    });
  });
}

// Update the x0, y0, x1 and y1 for the sankeyCircular, to allow space for any circular links
function scaleSankeySize(graph, margin, x0, x1, y0, y1, dx) {
  var maxColumn = max(graph.nodes, function (node) {
    return node.column;
  });

  var currentWidth = x1 - x0;
  var currentHeight = y1 - y0;

  var newWidth = currentWidth + margin.right + margin.left;
  var newHeight = currentHeight + margin.top + margin.bottom;

  var scaleX = currentWidth / newWidth;
  var scaleY = currentHeight / newHeight;

  x0 = x0 * scaleX + margin.left;
  x1 = margin.right == 0 ? x1 : x1 * scaleX;
  y0 = y0 * scaleY + margin.top;
  y1 = y1 * scaleY;

  graph.nodes.forEach(function (node) {
    node.x0 = x0 + node.column * ((x1 - x0 - dx) / maxColumn);
    node.x1 = node.x0 + dx;
  });

  return { scaleY: scaleY, x0: x0, x1: x1, y0: y0, y1: y1, dx: dx };
}

function getCircleMargins(graph, verticalMargin, baseRadius) {
  var totalTopLinksWidth = 0,
      totalBottomLinksWidth = 0,
      totalRightLinksWidth = 0,
      totalLeftLinksWidth = 0;

  var maxColumn = max(graph.nodes, function (node) {
    return node.column;
  });

  graph.links.forEach(function (link) {
    if (link.circular) {
      if (link.circularLinkType == 'top') {
        totalTopLinksWidth = totalTopLinksWidth + link.width;
      } else {
        totalBottomLinksWidth = totalBottomLinksWidth + link.width;
      }

      if (link.target.column == 0) {
        totalLeftLinksWidth = totalLeftLinksWidth + link.width;
      }

      if (link.source.column == maxColumn) {
        totalRightLinksWidth = totalRightLinksWidth + link.width;
      }
    }
  });

  //account for radius of curves and padding between links
  totalTopLinksWidth = totalTopLinksWidth > 0 ? totalTopLinksWidth + verticalMargin + baseRadius : totalTopLinksWidth;
  totalBottomLinksWidth = totalBottomLinksWidth > 0 ? totalBottomLinksWidth + verticalMargin + baseRadius : totalBottomLinksWidth;
  totalRightLinksWidth = totalRightLinksWidth > 0 ? totalRightLinksWidth + verticalMargin + baseRadius : totalRightLinksWidth;
  totalLeftLinksWidth = totalLeftLinksWidth > 0 ? totalLeftLinksWidth + verticalMargin + baseRadius : totalLeftLinksWidth;

  return {
    top: totalTopLinksWidth,
    bottom: totalBottomLinksWidth,
    left: totalLeftLinksWidth,
    right: totalRightLinksWidth
  };
}

function initializeNodeBreadth(id, scale, paddingRatio, columns, x0, x1, y0, y1, dx, py, value, graph, verticalMargin, baseRadius) {
  var newPy = py;
  // update `newPy` if nodePadding has been set
  if (paddingRatio) {
    var padding = Infinity;
    columns.forEach(function (nodes) {
      var thisPadding = y1 * paddingRatio / (nodes.length + 1);
      padding = thisPadding < padding ? thisPadding : padding;
    });
    newPy = padding;
  }

  var ky = min(columns, function (nodes) {
    return (y1 - y0 - (nodes.length - 1) * newPy) / sum(nodes, value);
  });

  //calculate the widths of the links
  ky = ky * scale;

  graph.links.forEach(function (link) {
    link.width = link.value * ky;
  });

  //determine how much to scale down the chart, based on circular links
  var margin = getCircleMargins(graph, verticalMargin, baseRadius);
  var scaleSankeySizeResult = scaleSankeySize(graph, margin, x0, x1, y0, y1, dx);
  var ratio = scaleSankeySizeResult.scaleY;
  var newX0 = scaleSankeySizeResult.x0;
  var newX1 = scaleSankeySizeResult.x1;
  var newY0 = scaleSankeySizeResult.y0;
  var newY1 = scaleSankeySizeResult.y1;
  var newDx = scaleSankeySizeResult.dx;

  //re-calculate widths
  ky = ky * ratio;

  graph.links.forEach(function (link) {
    link.width = link.value * ky;
  });

  columns.forEach(function (nodes) {
    var nodesLength = nodes.length;
    nodes.forEach(function (node, i) {
      if (node.depth == columns.length - 1 && nodesLength == 1) {
        node.y0 = newY1 / 2 - node.value * ky;
        node.y1 = node.y0 + node.value * ky;
      } else if (node.depth == 0 && nodesLength == 1) {
        node.y0 = newY1 / 2 - node.value * ky;
        node.y1 = node.y0 + node.value * ky;
      } else if (node.partOfCycle) {
        if (numberOfNonSelfLinkingCycles(node, id) == 0) {
          node.y0 = newY1 / 2 + i;
          node.y1 = node.y0 + node.value * ky;
        } else if (node.circularLinkType == 'top') {
          node.y0 = newY0 + i;
          node.y1 = node.y0 + node.value * ky;
        } else {
          node.y0 = newY1 - node.value * ky - i;
          node.y1 = node.y0 + node.value * ky;
        }
      } else {
        if (margin.top == 0 || margin.bottom == 0) {
          node.y0 = (newY1 - newY0) / nodesLength * i;
          node.y1 = node.y0 + node.value * ky;
        } else {
          node.y0 = (newY1 - newY0) / 2 - nodesLength / 2 + i;
          node.y1 = node.y0 + node.value * ky;
        }
      }
    });
  });
  return {
    newPy: newPy,
    columns: columns,
    graph: graph,
    newX0: newX0,
    newX1: newX1,
    newY0: newY0,
    newY1: newY1,
    newDx: newDx
  };
}

// Assign nodes' breadths, and then shift nodes that overlap (resolveCollisions)
function computeNodeBreadths(graph, iterations, id, scale, paddingRatio, verticalMargin, baseRadius, value, x0, x1, y0, y1, dx, py) {
  var columns = nest().key(function (d) {
    return d.column;
  }).sortKeys(ascending).entries(graph.nodes).map(function (d) {
    return d.values;
  });

  var initializeNodeBreadthResult = initializeNodeBreadth(id, scale, paddingRatio, columns, x0, x1, y0, y1, dx, py, value, graph, verticalMargin, baseRadius);
  var newPy = initializeNodeBreadthResult.newPy;
  columns = initializeNodeBreadthResult.columns;
  var newGraph = initializeNodeBreadthResult.graph;
  var newX0 = initializeNodeBreadthResult.newX0;
  var newX1 = initializeNodeBreadthResult.newX1;
  var newY0 = initializeNodeBreadthResult.newY0;
  var newY1 = initializeNodeBreadthResult.newY1;
  var newDx = initializeNodeBreadthResult.newDx;

  resolveCollisions(columns, newY0, newY1, newPy);

  for (var alpha = 1, n = iterations; n > 0; --n) {
    relaxLeftAndRight(alpha *= 0.99, id, columns, newY1);
    resolveCollisions(columns, newY0, newY1, newPy);
  }
  return {
    newPy: newPy,
    newGraph: newGraph,
    newX0: newX0,
    newX1: newX1,
    newY0: newY0,
    newY1: newY1,
    newDx: newDx
  };
}

// https://github.com/tomshanley/d3-sankeyCircular-circular

// return the value of a node or link
function value(d) {
  return d.value;
}

/* function weightedSource (link) {
    return nodeCenter(link.source) * link.value
  } */

/* function weightedTarget (link) {
    return nodeCenter(link.target) * link.value
  } */

// Return the default value for ID for node, d.index
function defaultId(d) {
  return d.index;
}

// Return the default object the graph's nodes, graph.nodes
function defaultNodes(graph) {
  return graph.nodes;
}

// Return the default object the graph's nodes, graph.links
function defaultLinks(graph) {
  return graph.links;
}

// The main sankeyCircular functions

// Some constants for circular link calculations
var verticalMargin = 25;
var baseRadius = 10;

//Possibly let user control this,
// although anything over 0.5 starts to get too cramped
var scale = 0.3;

function sankeyCircular () {
  // Set the default values
  var x0 = 0,
      y0 = 0,
      x1 = 1,
      y1 = 1,
      // extent
  dx = 24,
      // nodeWidth
  py,
      // nodePadding, for vertical postioning
  id = defaultId,
      align = justify,
      nodes = defaultNodes,
      links = defaultLinks,
      iterations = 32,
      circularLinkGap = 2,
      paddingRatio;

  function sankeyCircular() {
    var graph = {
      nodes: nodes.apply(null, arguments),
      links: links.apply(null, arguments)

      // Process the graph's nodes and links, setting their positions

      // 1.  Associate the nodes with their respective links, and vice versa
    };graph = computeNodeLinks(graph, id);

    // 2.  Determine which links result in a circular path in the graph
    graph = identifyCircles(graph, id);

    // 4. Calculate the nodes' values, based on the values
    // of the incoming and outgoing links
    graph = computeNodeValues(graph, value);

    // 5.  Calculate the nodes' depth based on the incoming and outgoing links
    //     Sets the nodes':
    //     - depth:  the depth in the graph
    //     - column: the depth (0, 1, 2, etc), as is relates to visual position from left to right
    //     - x0, x1: the x coordinates, as is relates to visual position from left to right
    graph = computeNodeDepths(graph, align);

    // 3.  Determine how the circular links will be drawn,
    //     either travelling back above the main chart ("top")
    //     or below the main chart ("bottom")
    graph = selectCircularLinkTypes(graph, id);

    // 6.  Calculate the nodes' and links' vertical position within their respective column
    //     Also readjusts sankeyCircular size if circular links are needed, and node x's
    var computeNodeBreadthsResult = computeNodeBreadths(graph, iterations, id, scale, paddingRatio, verticalMargin, baseRadius, value, x0, x1, y0, y1, dx, py);
    x0 = computeNodeBreadthsResult.newX0;
    x1 = computeNodeBreadthsResult.newX1;
    y0 = computeNodeBreadthsResult.newY0;
    y1 = computeNodeBreadthsResult.newY1;
    dx = computeNodeBreadthsResult.newDx;
    py = computeNodeBreadthsResult.newPy;
    graph = computeNodeBreadthsResult.newGraph;
    computeLinkBreadths(graph);

    // 7.  Sort links per node, based on the links' source/target nodes' breadths
    // 8.  Adjust nodes that overlap links that span 2+ columns

    //Possibly let user control this number, like the iterations over node placement
    var linkSortingIterations = 4;
    for (var iteration = 0; iteration < linkSortingIterations; iteration++) {
      sortSourceLinks(graph, y1, id);
      sortTargetLinks(graph, y1, id);
      resolveNodeLinkOverlaps(graph, y0, y1, id);
      sortSourceLinks(graph, y1, id);
      sortTargetLinks(graph, y1, id);
    }

    // 8.1  Adjust node and link positions back to fill height of chart area if compressed
    fillHeight(graph, y0, y1);

    // 9. Calculate visually appealling path for the circular paths, and create the "d" string
    addCircularPathData(graph, circularLinkGap, y1, id, baseRadius, verticalMargin);

    return graph;
  } // end of sankeyCircular function

  // Set the sankeyCircular parameters
  // nodeID, nodeAlign, nodeWidth, nodePadding, nodes, links, size, extent,
  // iterations, nodePaddingRatio, circularLinkGap
  sankeyCircular.nodeId = function (_) {
    return arguments.length ? (id = typeof _ === 'function' ? _ : constant(_), sankeyCircular) : id;
  };

  sankeyCircular.nodeAlign = function (_) {
    return arguments.length ? (align = typeof _ === 'function' ? _ : constant(_), sankeyCircular) : align;
  };

  sankeyCircular.nodeWidth = function (_) {
    return arguments.length ? (dx = +_, sankeyCircular) : dx;
  };

  sankeyCircular.nodePadding = function (_) {
    return arguments.length ? (py = +_, sankeyCircular) : py;
  };

  sankeyCircular.nodes = function (_) {
    return arguments.length ? (nodes = typeof _ === 'function' ? _ : constant(_), sankeyCircular) : nodes;
  };

  sankeyCircular.links = function (_) {
    return arguments.length ? (links = typeof _ === 'function' ? _ : constant(_), sankeyCircular) : links;
  };

  sankeyCircular.size = function (_) {
    return arguments.length ? (x0 = y0 = 0, x1 = +_[0], y1 = +_[1], sankeyCircular) : [x1 - x0, y1 - y0];
  };

  sankeyCircular.extent = function (_) {
    return arguments.length ? (x0 = +_[0][0], x1 = +_[1][0], y0 = +_[0][1], y1 = +_[1][1], sankeyCircular) : [[x0, y0], [x1, y1]];
  };

  sankeyCircular.iterations = function (_) {
    return arguments.length ? (iterations = +_, sankeyCircular) : iterations;
  };

  sankeyCircular.circularLinkGap = function (_) {
    return arguments.length ? (circularLinkGap = +_, sankeyCircular) : circularLinkGap;
  };

  sankeyCircular.nodePaddingRatio = function (_) {
    return arguments.length ? (paddingRatio = +_, sankeyCircular) : paddingRatio;
  };

  return sankeyCircular;
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

export { sankeyCircular, center as sankeyCenter, left as sankeyLeft, right as sankeyRight, justify as sankeyJustify };
