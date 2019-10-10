const colors = require('spencer-color').colors

class Label {
  constructor(text, world) {
    this.world = world
    this._text = text
    this.attrs = {}
    this._color = 'grey'
    this.fill = 'none'
    this._radius = 50
    this._width = 0.2
    this._min = 0
    this._x = 0
    this._r = 40
    this._size = 3
  }
  rBounds() {
    return {
      min: 0,
      max: this._radius
    }
  }
  xBounds() {
    return {
      min: this._x,
      max: this._x
    }
  }
  at(x) {
    this._x = x
    return this
  }
  min(x) {
    this._min = x
    return this
  }
  length(n) {
    this._length = n
    return this
  }
  color(c) {
    this._color = colors[c] || c
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
  drawLine() {
    let h = this.world.html
    let r = this.world.rScale(this._r * 0.9)
    let { x, y } = this.world.findPoint(this._x, r * 0.9)
    let min = this.world.findPoint(this._x, this._min)
    return h`<line x1=${min.x} y1=${min.y} x2=${x} y2=${y} stroke=${this._color} stroke-width=${this._width}/>`
  }
  drawText() {
    let world = this.world
    let h = world.html
    let r = world.rScale(this._r)
    let { x, y } = world.findPoint(this._x, r)
    return h`<text x=${x} y=${y} stroke="none" style="border:1px solid grey;" fill=${
      this._color
    } font-size=${
      this._size
    }  dominant-baseline="middle" text-anchor="middle" transform=rotate(${-world._rotate},${x},${y})>${
      this._text
    }</text>`
  }
  build() {
    let h = this.world.html
    return h`<g>
      ${this.drawLine()}
      ${this.drawText()}
    </g>`
  }
}
module.exports = Label
