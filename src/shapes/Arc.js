const d3Shape = require('d3-shape')
class Arc {
  constructor(obj = {}, world) {
    this.world = world
    this.data = obj.data || []
    this.attrs = {}
    this.color = 'none'
    this.fill = 'steelblue'
    this._radius = 25
    this.width = 5
    this._from = 0
    this._to = 50
  }
  rBounds() {
    return {
      min: 0,
      max: this._radius
    }
  }
  xBounds() {
    return {
      min: this._from,
      max: this._to
    }
  }
  width(n) {
    this.width = n
    return this
  }
  radius(n) {
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
      outerRadius: r + rScale(this.width)
    })
  }
  build() {
    let h = this.world.html
    let attrs = {
      d: this.path(),
      stroke: this.color,
      fill: this.fill
    }
    return h`<path ...${attrs}/>`
  }
}
module.exports = Arc
