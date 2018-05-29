// return the distance between the link's target and source node, in terms of the nodes' X coordinate
export default function linkXLength(link) {
  return link.target.x0 - link.source.x1
}
