const htm = require('htm')
const vhtml = require('vhtml')
const scaleLinear = require('./_linear')
const Line = require('./shapes/Line')
const Circle = require('./shapes/Circle')
const Arc = require('./shapes/Arc')
const Text = require('./shapes/Text')
const Label = require('./shapes/Label')
const trig = [-Math.PI, Math.PI]

class World {
  constructor(obj = {}) {
    this.width = 100
    this.height = 100
    this._from = obj.from || 0
    this._to = obj.to || 0
    this._rotate = obj.rotate || 0
    this.shapes = []
    this.xScale = scaleLinear({
      world: trig,
      minmax: [0, 100]
    })
    this.rScale = scaleLinear({
      world: [0, 50],
      minmax: [0, 100]
    })
    this.html = htm.bind(vhtml)
  }
  findPoint(x, r) {
    let xScale = this.xScale
    let angle = xScale(x)
    return {
      x: r * Math.sin(angle),
      y: -r * Math.cos(angle)
    }
  }
  bind(fn) {
    this.html = htm.bind(fn)
  }
  from(n) {
    this._from = n
    return this
  }
  to(n) {
    this._to = n
    return this
  }
  rotate(n) {
    this._rotate = n
    return this
  }

  // shapes
  line(obj) {
    let shape = new Line(obj, this)
    this.shapes.push(shape)
    return shape
  }
  circle(obj) {
    let shape = new Circle(obj, this)
    this.shapes.push(shape)
    return shape
  }
  arc(obj) {
    let shape = new Arc(obj, this)
    this.shapes.push(shape)
    return shape
  }
  text(obj) {
    let shape = new Text(obj, this)
    this.shapes.push(shape)
    return shape
  }
  label(obj) {
    let shape = new Label(obj, this)
    this.shapes.push(shape)
    return shape
  }

  // scaling logic
  fitX() {
    let min = 0
    let max = 0
    this.shapes.forEach(s => {
      let o = s.xBounds()
      if (o.min !== null && o.min < min) {
        min = o.min
      }
      if (o.max !== null && o.max > max) {
        max = o.max
      }
    })
    if (min === 0 && max === 0) {
      max = 100
    }
    this.xScale = scaleLinear({
      world: trig,
      minmax: [min, max]
    })
  }
  fitR() {
    let min = 0
    let max = 0
    this.shapes.forEach(s => {
      let o = s.rBounds()
      if (o.min !== null && o.min < min) {
        min = o.min
      }
      if (o.max !== null && o.max > max) {
        max = o.max
      }
    })
    this.rScale = scaleLinear({
      world: [0, 50],
      minmax: [min, max]
    })
  }
  fit() {
    this.fitX()
    this.fitR()
    return this
  }
  build() {
    let h = this.html
    let elements = []

    // if (this.xAxis) {
    //   elements.push(this.xAxis.build())
    // }
    elements = elements.concat(this.shapes.map(shape => shape.build()))
    let attrs = {
      // width: this.width,
      // height: this.height,
      viewBox: `-50,-50,${this.width},${this.height}`,
      // viewBox: `0,0,10,10`,
      preserveAspectRatio: 'xMidYMid meet',
      transform: `rotate(${this._rotate},0,0)`
      // style: 'overflow:visible; margin: 10px 20px 25px 25px;' // border:1px solid lightgrey;
    }
    return h`<svg ...${attrs}>
      ${elements}
    </svg>`
  }
}
module.exports = World
