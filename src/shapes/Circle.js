class Circle {
  constructor(obj = {}, world) {
    this.world = world
    this.data = obj.data || []
    this.attrs = {}
    this.color = 'lightgrey'
    this.fill = 'none'
    this.radius = 25
    this.width = 0.2
  }
  width(n) {
    this.width = n
    return this
  }
  build() {
    let h = this.world.html

    let attrs = {
      cx: '0',
      cy: '0',
      r: this.radius,
      stroke: this.color,
      fill: this.fill,
      'stroke-width': this.width
    }
    return h`<circle ...${attrs}/>`
  }
}
module.exports = Circle
