const defaults = {
  stroke: '#d7d5d2',
  'stroke-width': 1,
  'vector-effect': 'non-scaling-stroke'
}
class XAxis {
  constructor(obj = {}, world) {
    this.world = world

    this.attrs = Object.assign({}, defaults, obj)
    this._show = false
  }
  remove() {
    this._show = false
    return this
  }
  show() {
    this._show = true
    return this
  }
}
module.exports = XAxis
