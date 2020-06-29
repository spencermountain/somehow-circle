//export let name = ''
import * as d3Shape from 'd3-shape'
import scale from '../lib/scale'
let q = Math.PI / 2
const trig = [-Math.PI, Math.PI]
// const trig = [-0.5 * Math.PI, 0.5 * Math.PI]
// const trig = [0, 1]

function toRadian(deg) {
  var pi = Math.PI
  return deg * (pi / 180)
}

const maxRadius = function (items) {
  let max = 0
  items.forEach((o) => {
    let r = o.radius + o.width
    if (r > max) {
      max = r
    }
  })
  return max
}

const layout = function (items, world) {
  let radius = maxRadius(items)
  let xScale = scale({ minmax: [world.from, world.to], world: trig })
  let rotate = 0 //toRadian(world.rotate)
  console.log(world.rotate)
  let rScale = scale({ minmax: [0, radius], world: [0, 50] })
  let shapes = items.map((obj) => {
    let r = rScale(obj.radius)
    let path = d3Shape.arc()({
      startAngle: xScale(obj.to) - q + rotate,
      endAngle: xScale(obj.from) - q + rotate,
      innerRadius: r,
      outerRadius: r + rScale(obj.width)
    })
    return {
      path: path,
      color: obj.color
    }
  })
  return shapes
}
export default layout
