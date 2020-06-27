//export let name = ''
import * as d3Shape from 'd3-shape'
import scale from '../lib/scale'
const trig = [-Math.PI, Math.PI]

const layout = function (items, data) {
  // console.log(data)
  let xScale = scale({ minmax: [data.from, data.to], world: trig })

  let rScale = scale({ minmax: [0, data.radius], world: [-50, 50] })
  // console.log(rScale(250))
  let paths = items.map((obj) => {
    // console.log(obj)
    let r = rScale(obj.radius)
    let path = d3Shape.arc()({
      startAngle: xScale(obj.to),
      endAngle: xScale(obj.from),
      innerRadius: r,
      outerRadius: r + rScale(obj.width)
    })
    // console.log(path)
    return {
      startAngle: xScale(obj.to),
      endAngle: xScale(obj.from),
      color: obj.color,
      path: path
    }
  })
  // console.log(paths)
  return paths
}
export default layout
