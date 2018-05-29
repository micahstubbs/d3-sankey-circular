// sort nodes' breadth (ie top to bottom in a column)
// if both nodes have circular links, or both don't have circular links, then sort by the top (y0) of the node
// else push nodes that have top circular links to the top, and nodes that have bottom circular links to the bottom
export default function ascendingBreadth(a, b) {
  if (a.partOfCycle === b.partOfCycle) {
    return a.y0 - b.y0
  } else {
    if (a.circularLinkType === 'top' || b.circularLinkType === 'bottom') {
      return -1
    } else {
      return 1
    }
  }
}
