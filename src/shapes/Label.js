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
    this._x = 0
    this._r = 40
    this._size = 4
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
    let { x, y } = this.world.findPoint(this._x, r)
    return h`<line x1=0 y1=0 x2=${x} y2=${y} stroke=${this._color} stroke-width=${this._width}/>`
  }
  drawText() {
    let h = this.world.html
    let r = this.world.rScale(this._r)
    let { x, y } = this.world.findPoint(this._x, r)
    return h`<text x=${x} y=${y} stroke="none" fill=${this._color} font-size=${this._size} dx="-0.3em" dy="0.2em">${this._text}</text>`
  }
  build() {
    let h = this.world.html
    let xScale = this.world.xScale
    // console.log(xScale(50))
    // console.log(xScale(this._x))

    // let attrs = {
    //   cx: '0',
    //   cy: '0',
    //   r: rScale(this._radius),
    //   stroke: this._color,
    //   fill: this.fill,
    //   'stroke-width': this._width
    // }
    return h`<g>
      ${this.drawLine()}
      ${this.drawText()}
    </g>`
  }
}
module.exports = Label
