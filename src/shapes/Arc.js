const d3Shape = require('d3-shape')
const colors = require('spencer-color').colors

class Arc {
  constructor(obj = {}, world) {
    this.world = world
    this.data = obj.data || []
    this.attrs = {}
    this._stroke = 'none'
    this._fill = 'steelblue'
    this._radius = 25
    this._width = 5
    this._from = 0
    this._to = 50
    this._opacity = 1
  }
  opacity(n) {
    this._opacity = n
    return this
  }
  dotted(n) {
    if (n === true) {
      n = 4
    }
    this.attrs['stroke-dasharray'] = n || 4
    return this
  }
  rBounds() {
    return {
      min: 0,
      max: this._radius + this._width
    }
  }
  xBounds() {
    return {
      min: this._from,
      max: this._to
    }
  }
  color(c) {
    this._fill = colors[c] || c
    return this
  }
  stroke(c) {
    this._stroke = colors[c] || c
    return this
  }
  width(n) {
    this._width = n
    return this
  }
  radius(n) {
    this._radius = n
    return this
  }
  r(n) {
    this._radius = n
    return this
  }
  from(n) {
    this._from = n
    return this
  }
  to(n) {
    this._to = n
    return this
  }
  path() {
    let rScale = this.world.rScale
    let xScale = this.world.xScale
    let r = rScale(this._radius)
    return d3Shape.arc()({
      startAngle: xScale(this._from),
      endAngle: xScale(this._to),
      innerRadius: r,
      outerRadius: r // + rScale(this._width)
    })
  }
  build() {
    let h = this.world.html
    let attrs = {
      d: this.path(),
      stroke: this._fill,
      'stroke-width': this._width,
      fill: 'none',
      opacity: this._opacity,
      'stroke-dasharray': this.attrs['stroke-dasharray']
    }
    return h`<path ...${attrs}/>`
  }
}
module.exports = Arc
