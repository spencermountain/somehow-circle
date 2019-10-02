const htm = require('htm')
const vhtml = require('vhtml')
const scaleLinear = require('./_linear')
const Line = require('./shapes/Line')
const Circle = require('./shapes/Circle')
const Text = require('./shapes/Text')

class World {
  constructor(obj = {}) {
    this.width = 100
    this.height = 100
    this.html = htm.bind(vhtml)
    this.shapes = []
    this.xScale = scaleLinear({
      world: [0, 2 * Math.PI],
      minmax: [0, 100]
    })
    this.rScale = scaleLinear({
      world: [0, 50],
      minmax: [0, 100]
    })
  }
  bind(fn) {
    this.html = htm.bind(fn)
  }
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
  text(obj) {
    let shape = new Text(obj, this)
    this.shapes.push(shape)
    return shape
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
      preserveAspectRatio: 'xMidYMid meet'
      // style: 'overflow:visible; margin: 10px 20px 25px 25px;' // border:1px solid lightgrey;
    }
    return h`<svg ...${attrs}>
      ${elements}
    </svg>`
  }
}
module.exports = World
