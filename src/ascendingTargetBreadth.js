import ascendingBreadth from './ascendingBreadth'

// sort links' breadth (ie top to bottom in a column),
// based on their target nodes' breadths
export default function ascendingTargetBreadth(a, b) {
  return ascendingBreadth(a.target, b.target) || a.index - b.index
}
