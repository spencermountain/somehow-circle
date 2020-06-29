//export let name = ''
import * as d3Shape from 'd3-shape'
import scale from '../lib/scale'
let q = Math.PI / 2
const trig = [-Math.PI, Math.PI]
// const trig = [-0.5 * Math.PI, 0.5 * Math.PI]
// const trig = [0, 1]

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

const layout = function (items, data) {
  let radius = maxRadius(items)
  let xScale = scale({ minmax: [data.from, data.to], world: trig })

  let rScale = scale({ minmax: [0, radius], world: [0, 50] })
  let paths = items.map((obj) => {
    let r = rScale(obj.radius)
    let path = d3Shape.arc()({
      startAngle: xScale(obj.to) - q,
      endAngle: xScale(obj.from) - q,
      innerRadius: r,
      outerRadius: r + rScale(obj.width)
    })
    return {
      color: obj.color,
      path: path
    }
  })
  // console.log(paths)
  return paths
}
export default layout
