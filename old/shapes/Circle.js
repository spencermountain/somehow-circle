const colors = require('spencer-color').colors

class Circle {
  constructor(obj = {}, world) {
    this.world = world
    this.attrs = {}
    this._color = 'lightgrey'
    this.fill = 'none'
    this._radius = 50
    this._width = 0.2
  }
  rBounds() {
    return {
      min: 0,
      max: this._radius + this._width
    }
  }
  color(c) {
    this._color = colors[c] || c
    return this
  }
  xBounds() {
    return {
      min: null,
      max: null //hmm
    }
  }
  width(n) {
    this._width = n
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
      stroke: this._color,
      fill: this.fill,
      'stroke-width': this._width
    }
    return h`<circle ...${attrs}/>`
  }
}
module.exports = Circle
