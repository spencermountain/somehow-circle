//export let name = ''
import scale from '../lib/scale'
import drawArcs from './drawArcs'
import drawLines from './drawLines'
import drawLabels from './drawLabels'

let q = Math.PI / 2
const trig = [-Math.PI, Math.PI]

function toRadian(deg) {
  var pi = Math.PI
  return deg * (pi / 180)
}

const maxRadius = function (arcs, lines) {
  let max = 0
  arcs.forEach((o) => {
    let r = o.radius + o.width
    if (r > max) {
      max = r
    }
  })
  lines.forEach((l) => {
    let r = l.radius + l.length + l.width
    if (r > max) {
      max = r
    }
  })
  return max
}

const layout = function (arcs, lines, labels, world) {
  let xScale = scale({ minmax: [world.from, world.to], world: trig })
  let rotate = toRadian(world.rotate)
  // console.log(world.rotate)

  let maxR = maxRadius(arcs, lines)
  maxR = maxR + world.margin
  let rScale = scale({ minmax: [0, maxR], world: [0, 50] })

  // draw arcs
  let shapes = drawArcs(arcs, xScale, rScale, q, rotate)
  // draw lines
  shapes = shapes.concat(drawLines(lines, xScale, rScale, q, rotate))
  // draw ticks
  shapes = shapes.concat(drawLabels(labels, xScale, rScale, q, rotate))
  console.log(shapes)
  return shapes
}
export default layout
