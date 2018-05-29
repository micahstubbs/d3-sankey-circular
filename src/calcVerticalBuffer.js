import sortLinkColumnAscending from './sortLinkColumnAscending'
import selfLinking from './selfLinking'
import circularLinksCross from './circularLinksCross'
import onlyCircularLink from './onlyCircularLink'

// creates vertical buffer values per set of top/bottom links
export default function calcVerticalBuffer(links, circularLinkGap, id) {
  links.sort(sortLinkColumnAscending)
  links.forEach(function(link, i) {
    var buffer = 0

    if (selfLinking(link, id) && onlyCircularLink(link)) {
      link.circularPathData.verticalBuffer = buffer + link.width / 2
    } else {
      var j = 0
      for (j; j < i; j++) {
        if (circularLinksCross(links[i], links[j])) {
          var bufferOverThisLink =
            links[j].circularPathData.verticalBuffer +
            links[j].width / 2 +
            circularLinkGap
          buffer = bufferOverThisLink > buffer ? bufferOverThisLink : buffer
        }
      }

      link.circularPathData.verticalBuffer = buffer + link.width / 2
    }
  })

  return links
}
