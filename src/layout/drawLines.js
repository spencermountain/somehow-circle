import * as d3Shape from 'd3-shape'
import world from '../world.js'
import { get } from 'svelte/store'

const drawLines = function (obj, xScale, rScale) {
  let { q, rotate } = get(world)
  // draw lines
  let data = [
    { angle: obj.angle, radius: obj.radius },
    { angle: obj.angle, radius: obj.length + obj.radius }
  ]
  let path = d3Shape
    .radialLine()
    .angle((d) => xScale(d.angle) - q + rotate)
    .radius((d) => rScale(d.radius))
  return {
    type: 'line',
    path: path(data),
    color: obj.color,
    width: obj.width
  }
}
export default drawLines
