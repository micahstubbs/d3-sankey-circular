// Check if two circular links potentially overlap
export default function circularLinksCross(link1, link2) {
  if (link1.source.column < link2.target.column) {
    return false
  } else if (link1.target.column > link2.source.column) {
    return false
  } else {
    return true
  }
}
