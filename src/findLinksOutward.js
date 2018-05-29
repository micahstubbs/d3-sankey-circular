// Given a node, find all links for which this is a source in the current 'known' graph
export default function findLinksOutward(node, graph) {
  var children = []

  for (var i = 0; i < graph.length; i++) {
    if (node == graph[i].source) {
      children.push(graph[i])
    }
  }

  return children
}
