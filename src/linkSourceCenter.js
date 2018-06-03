import nodeCenter from './nodeCenter'

// return the vertical center of a link's source node
export default function linkSourceCenter(link) {
  return nodeCenter(link.source)
}
