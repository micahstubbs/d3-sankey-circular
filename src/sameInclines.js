import incline from './incline'

// test if links both slope up, or both slope down
export default function sameInclines(link1, link2) {
  return incline(link1) == incline(link2)
}
