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
  let clockwise = attrs.endAngle < attrs.startAngle
  let arrow = {}
  if (clockwise) {
  }
  return {
    type: 'arrow',
    clockwise: clockwise,
    path: path,
    color: obj.color,
    arrow: arrow
  }
}
export default drawArcs
