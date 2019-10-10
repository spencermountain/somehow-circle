const colors = require('spencer-color').colors

class Label {
  constructor(obj = {}, world) {
    this.world = world
    this.attrs = {}
    this._color = 'lightgrey'
    this.fill = 'none'
    this._radius = 50
    this._width = 0.2
    this._x = 0
    this._length = 50
  }
  rBounds() {
    return {
      min: 0,
      max: this._radius + this._width
    }
  }
  xBounds() {
    return {
      min: null,
      max: null //hmm
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
    let { x, y } = this.world.findPoint(this._x, 15)
    return h`<line x1=0 y1=0 x2=${x} y2=${y} stroke="black"/>`
  }
  drawText() {
    let world = this.world
    let h = this.world.html
    let arr = [0, 10, 20, 30, 40, 50, 60]
    arr = arr.map(n => {
      let o = world.findPoint(n, 25)
      // return h`<line x1=0 y1=0 x2=${x} y2=${y} stroke="black"/>`
      return h`<text x=${o.x} y=${o.y} stroke="black"   dx="-0.3em" dy="0.2em">${n}</text>`
    })
    return h`<g>
      ${arr}
    </g>`
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
