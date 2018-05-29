import linkAngle from './linkAngle'
import linkXLength from './linkXLength'
import incline from './incline'

// Return the Y coordinate on the longerLink path *
// which is perpendicular shorterLink's source.
//
// * approx, based on a straight line from target to source,
// when in fact the path is a bezier
export default function linkPerpendicularYToLinkTarget(
  longerLink,
  shorterLink
) {
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
