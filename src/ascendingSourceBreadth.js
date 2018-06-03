import ascendingBreadth from './ascendingBreadth'

// sort links' breadth (ie top to bottom in a column),
// based on their source nodes' breadths
export default function ascendingSourceBreadth(a, b) {
  return ascendingBreadth(a.source, b.source) || a.index - b.index
}
