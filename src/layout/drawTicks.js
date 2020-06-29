import * as d3Shape from 'd3-shape'

const findPoint = function (angle, r) {
  return {
    x: r * Math.sin(angle),
    y: -r * Math.cos(angle)
  }
}

const drawTicks = function (ticks, xScale, rScale, q, rotate) {
  return ticks.map((obj) => {
    let r = rScale(obj.radius)
    let path = d3Shape.arc()({
      startAngle: xScale(obj.to) - q + rotate,
      endAngle: xScale(obj.from) - q + rotate,
      innerRadius: r,
      outerRadius: r + rScale(obj.width)
    })
    return {
      type: 'ticks',
      path: path,
      color: obj.color
    }
  })
}
export default drawTicks
