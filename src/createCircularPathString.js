// create a d path using the circularPathData
export default function createCircularPathString(link) {
      var pathString = ''

      if (link.circularLinkType == 'top') {
            pathString =
                  // start at the right of the source node
                  'M' +
                  link.circularPathData.sourceX +
                  ' ' +
                  link.circularPathData.sourceY +
                  ' ' +
                  // line right to buffer point
                  'L' +
                  link.circularPathData.leftInnerExtent +
                  ' ' +
                  link.circularPathData.sourceY +
                  ' ' +
                  // Arc around: Centre of arc X and  //Centre of arc Y
                  'A' +
                  link.circularPathData.leftLargeArcRadius +
                  ' ' +
                  link.circularPathData.leftSmallArcRadius +
                  ' 0 0 0 ' +
                  // End of arc X //End of arc Y
                  link.circularPathData.leftFullExtent +
                  ' ' +
                  (link.circularPathData.sourceY -
                        link.circularPathData.leftSmallArcRadius) +
                  ' ' + // End of arc X
                  // line up to buffer point
                  'L' +
                  link.circularPathData.leftFullExtent +
                  ' ' +
                  link.circularPathData.verticalLeftInnerExtent +
                  ' ' +
                  // Arc around: Centre of arc X and  //Centre of arc Y
                  'A' +
                  link.circularPathData.leftLargeArcRadius +
                  ' ' +
                  link.circularPathData.leftLargeArcRadius +
                  ' 0 0 0 ' +
                  // End of arc X //End of arc Y
                  link.circularPathData.leftInnerExtent +
                  ' ' +
                  link.circularPathData.verticalFullExtent +
                  ' ' + // End of arc X
                  // line left to buffer point
                  'L' +
                  link.circularPathData.rightInnerExtent +
                  ' ' +
                  link.circularPathData.verticalFullExtent +
                  ' ' +
                  // Arc around: Centre of arc X and  //Centre of arc Y
                  'A' +
                  link.circularPathData.rightLargeArcRadius +
                  ' ' +
                  link.circularPathData.rightLargeArcRadius +
                  ' 0 0 0 ' +
                  // End of arc X //End of arc Y
                  link.circularPathData.rightFullExtent +
                  ' ' +
                  link.circularPathData.verticalRightInnerExtent +
                  ' ' + // End of arc X
                  // line down
                  'L' +
                  link.circularPathData.rightFullExtent +
                  ' ' +
                  (link.circularPathData.targetY -
                        link.circularPathData.rightSmallArcRadius) +
                  ' ' +
                  // Arc around: Centre of arc X and  //Centre of arc Y
                  'A' +
                  link.circularPathData.rightLargeArcRadius +
                  ' ' +
                  link.circularPathData.rightSmallArcRadius +
                  ' 0 0 0 ' +
                  // End of arc X //End of arc Y
                  link.circularPathData.rightInnerExtent +
                  ' ' +
                  link.circularPathData.targetY +
                  ' ' + // End of arc X
                  // line to end
                  'L' +
                  link.circularPathData.targetX +
                  ' ' +
                  link.circularPathData.targetY
      } else {
            // bottom path
            pathString =
                  // start at the right of the source node
                  'M' +
                  link.circularPathData.sourceX +
                  ' ' +
                  link.circularPathData.sourceY +
                  ' ' +
                  // line right to buffer point
                  'L' +
                  link.circularPathData.leftInnerExtent +
                  ' ' +
                  link.circularPathData.sourceY +
                  ' ' +
                  // Arc around: Centre of arc X and  //Centre of arc Y
                  'A' +
                  link.circularPathData.leftLargeArcRadius +
                  ' ' +
                  link.circularPathData.leftSmallArcRadius +
                  ' 0 0 1 ' +
                  // End of arc X //End of arc Y
                  link.circularPathData.leftFullExtent +
                  ' ' +
                  (link.circularPathData.sourceY +
                        link.circularPathData.leftSmallArcRadius) +
                  ' ' + // End of arc X
                  // line down to buffer point
                  'L' +
                  link.circularPathData.leftFullExtent +
                  ' ' +
                  link.circularPathData.verticalLeftInnerExtent +
                  ' ' +
                  // Arc around: Centre of arc X and  //Centre of arc Y
                  'A' +
                  link.circularPathData.leftLargeArcRadius +
                  ' ' +
                  link.circularPathData.leftLargeArcRadius +
                  ' 0 0 1 ' +
                  // End of arc X //End of arc Y
                  link.circularPathData.leftInnerExtent +
                  ' ' +
                  link.circularPathData.verticalFullExtent +
                  ' ' + // End of arc X
                  // line left to buffer point
                  'L' +
                  link.circularPathData.rightInnerExtent +
                  ' ' +
                  link.circularPathData.verticalFullExtent +
                  ' ' +
                  // Arc around: Centre of arc X and  //Centre of arc Y
                  'A' +
                  link.circularPathData.rightLargeArcRadius +
                  ' ' +
                  link.circularPathData.rightLargeArcRadius +
                  ' 0 0 1 ' +
                  // End of arc X //End of arc Y
                  link.circularPathData.rightFullExtent +
                  ' ' +
                  link.circularPathData.verticalRightInnerExtent +
                  ' ' + // End of arc X
                  // line up
                  'L' +
                  link.circularPathData.rightFullExtent +
                  ' ' +
                  (link.circularPathData.targetY +
                        link.circularPathData.rightSmallArcRadius) +
                  ' ' +
                  // Arc around: Centre of arc X and  //Centre of arc Y
                  'A' +
                  link.circularPathData.rightLargeArcRadius +
                  ' ' +
                  link.circularPathData.rightSmallArcRadius +
                  ' 0 0 1 ' +
                  // End of arc X //End of arc Y
                  link.circularPathData.rightInnerExtent +
                  ' ' +
                  link.circularPathData.targetY +
                  ' ' + // End of arc X
                  // line to end
                  'L' +
                  link.circularPathData.targetX +
                  ' ' +
                  link.circularPathData.targetY
      }

      return pathString
}
