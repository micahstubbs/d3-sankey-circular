// Return the angle between a straight line between
// the source and target of the link,
// and the vertical plane of the node
export default function linkAngle(link) {
  var adjacent = Math.abs(link.y1 - link.y0)
  var opposite = Math.abs(link.target.x0 - link.source.x1)

  return Math.atan(opposite / adjacent)
}
