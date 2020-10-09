//export let name = ''
import scale from '../lib/scale'
import drawArcs from './drawArcs'
import drawArrows from './drawArrows'
import drawLines from './drawLines'
import drawLabels from './drawLabels'
import drawTicks from './drawTicks'

let q = Math.PI / 2
const trig = [-Math.PI, Math.PI]

function toRadian(deg) {
  var pi = Math.PI
  return deg * (pi / 180)
}

const maxRadius = function (shapes) {
  let max = 0
  shapes.forEach((o) => {
    let r = o.radius + o.width
    if (r > max) {
      max = r
    }
  })
  return max
}

const layout = function (arcs, lines, labels, ticks, arrows, world) {
  let xScale = scale({ minmax: [world.from, world.to], world: trig })
  let rotate = toRadian(world.rotate)
  // console.log(world.rotate)

  let arr = arcs.concat(lines, labels, arrows)
  let maxR = maxRadius(arr)
  maxR = maxR + world.margin
  let rScale = scale({ minmax: [0, maxR], world: [0, 50] })

  // draw arcs
  let shapes = drawArcs(arcs, xScale, rScale, q, rotate)
  // draw lines
  shapes = shapes.concat(drawLines(lines, xScale, rScale, q, rotate))
  // draw kabeks
  shapes = shapes.concat(drawLabels(labels, xScale, rScale, q, rotate))
  // draw ticks
  shapes = shapes.concat(drawTicks(ticks, xScale, rScale, q, rotate))
  // draw arrows
  shapes = shapes.concat(drawArrows(arrows, xScale, rScale, q, rotate))
  return shapes
}
export default layout
