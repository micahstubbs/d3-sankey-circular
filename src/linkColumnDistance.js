// return the distance between the link's target and source node,
// in terms of the nodes' column
export default function linkColumnDistance(link) {
  return link.target.column - link.source.column
}
