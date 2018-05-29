import getNodeID from './getNodeID'

// check if link is self linking, ie links a node to the same node
export default function selfLinking(link, id) {
  return getNodeID(link.source, id) == getNodeID(link.target, id)
}
