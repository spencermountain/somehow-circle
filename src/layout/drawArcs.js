import * as d3Shape from 'd3-shape'
import world from '../world.js'
import { get } from 'svelte/store'

const drawArcs = function (obj, xScale, rScale) {
  let { q, rotate } = get(world)
  let r = rScale(obj.radius)
  let attrs = {
    startAngle: xScale(obj.to) - q + rotate,
    endAngle: xScale(obj.from) - q + rotate,
    innerRadius: r,
    outerRadius: r + rScale(obj.width)
  }
  let path = d3Shape.arc()(attrs)
  return { path }
}
export default drawArcs
