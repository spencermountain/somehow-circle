class Circle {
  constructor(obj = {}, world) {
    this.world = world
    this.attrs = {}
    this.color = 'lightgrey'
    this.fill = 'none'
    this._radius = 50
    this.width = 0.2
  }
  rBounds() {
    return {
      min: 0,
      max: this.radius
    }
  }
  xBounds() {
    return {
      min: null,
      max: null //hmm
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
  build() {
    let h = this.world.html
    let rScale = this.world.rScale

    let attrs = {
      cx: '0',
      cy: '0',
      r: rScale(this._radius),
      stroke: this.color,
      fill: this.fill,
      'stroke-width': this.width
    }
    return h`<circle ...${attrs}/>`
  }
}
module.exports = Circle
