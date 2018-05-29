// sort descending links by their source vertical position, y0
export default function sortLinkSourceYDescending(link1, link2) {
  return link2.y0 - link1.y0
}
