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
    this.closed = true
    this._width = 1
  }
  rBounds() {
    let min = 0
    let max = 0
    this.data.forEach(o => {
      if (o.r > max) {
        max = o.r + this._width
      }
      if (o.r < min) {
        min = o.r
      }
    })
    return {
      min: min,
      max: max
    }
  }
  xBounds() {
    let min = 0
    let max = 0
    this.data.forEach(o => {
      if (o.x > max) {
        max = o.x
      }
      if (o.x < min) {
        min = o.x
      }
    })
    return {
      min: min,
      max: max
    }
  }
  straight() {
    this.curve = d3Shape.curveLinearClosed
    return this
  }
  close(bool) {
    this.closed = bool
    if (this.curve === d3Shape.curveLinearClosed || this.curve === d3Shape.curveLinearOpen) {
      this.curve = bool ? d3Shape.curveLinearClosed : d3Shape.curveLinearOpen
    } else {
      this.curve = bool ? d3Shape.curveCatmullRomClosed : d3Shape.curveCatmullRomOpen
    }
    return this
  }
  open(bool) {
    return this.close(!bool)
  }
  color(c) {
    this.color = colors[c] || c
    return this
  }
  fill(c) {
    this.fill = colors[c] || c
    return this
  }
  set(data) {
    this.data = data
    return this
  }
  width(n) {
    this._width = n
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
        return rScale(d.r)
      })
      .curve(this.curve)
    return line(data)
  }
  build() {
    let h = this.world.html

    let path = this.path(this.data)
    let attrs = {
      d: path,
      stroke: this.color,
      fill: this.fill,
      'stroke-width': this._width
    }
    return h`<path ...${attrs}/>`
  }
}
module.exports = Line
