const d3Shape = require('d3-shape')
const colors = require('spencer-color').colors

class Line {
  constructor(obj = {}, world) {
    this.world = world
    this.data = obj.data || []
    this.attrs = {}
    this.curve = d3Shape.curveCatmullRomClosed
    this.color = 'steelblue'
    this.fill = 'none'
  }
  straight() {
    this.curve = this.curve = d3Shape.curveLinearClosed
    return this
  }
  color(c) {
    this.color = colors[c] || c
    return this
  }
  fill(c) {
    this.fill = colors[c] || c
    return this
  }
  path(data) {
    let x = this.world.xScale
    let rScale = this.world.rScale
    let line = d3Shape
      .radialLine()
      .angle(function(d) {
        return x(d.x)
      })
      .radius(function(d) {
        return rScale(d.y)
      })
      .curve(this.curve)
    return line(data)
  }
  build() {
    let h = this.world.html

    let data = [
      { x: 3, y: 2 },
      { x: 13, y: 22 },
      { x: 23, y: 42 },
      { x: 33, y: 12 },
      { x: 53, y: 99 },
      { x: 63, y: 22 },
      { x: 73, y: 92 },
      { x: 83, y: 12 }
    ]
    let path = this.path(data)
    let attrs = {
      d: path,
      stroke: this.color,
      fill: this.fill
    }
    return h`<path ...${attrs}/>`
  }
}
module.exports = Line
