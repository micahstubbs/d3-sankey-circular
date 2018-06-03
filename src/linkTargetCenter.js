import nodeCenter from './nodeCenter'

// return the vertical center of a link's target node
export default function linkTargetCenter(link) {
  return nodeCenter(link.target)
}
