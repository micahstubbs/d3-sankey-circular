// returns the slope of a link, from source to target
// up => slopes up from source to target
// down => slopes down from source to target
export default function incline(link) {
  return link.y0 - link.y1 > 0 ? 'up' : 'down'
}
