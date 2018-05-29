// check if two nodes overlap
export default function nodesOverlap(nodeA, nodeB) {
  // test if nodeA top partially overlaps nodeB
  if (nodeA.y0 > nodeB.y0 && nodeA.y0 < nodeB.y1) {
    return true
  } else if (nodeA.y1 > nodeB.y0 && nodeA.y1 < nodeB.y1) {
    // test if nodeA bottom partially overlaps nodeB
    return true
  } else if (nodeA.y0 < nodeB.y0 && nodeA.y1 > nodeB.y1) {
    // test if nodeA covers nodeB
    return true
  } else {
    return false
  }
}
