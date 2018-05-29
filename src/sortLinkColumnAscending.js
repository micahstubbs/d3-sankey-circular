import linkColumnDistance from './linkColumnDistance'
import sortLinkSourceYDescending from './sortLinkSourceYDescending'
import sortLinkSourceYAscending from './sortLinkSourceYAscending'

// sort links based on the distance between the source and tartget node columns
// if the same, then use Y position of the source node
export default function sortLinkColumnAscending(link1, link2) {
  if (linkColumnDistance(link1) == linkColumnDistance(link2)) {
    return link1.circularLinkType == 'bottom'
      ? sortLinkSourceYDescending(link1, link2)
      : sortLinkSourceYAscending(link1, link2)
  } else {
    return linkColumnDistance(link2) - linkColumnDistance(link1)
  }
}
