import * as d3Shape from 'd3-shape'

const drawLines = function (lines, xScale, rScale, q, rotate) {
  // draw lines
  return lines.map((obj) => {
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
  })
}
export default drawLines
