class Text {
  constructor(txt = '', world) {
    this.world = world
    this.attrs = {}
    this.text = txt
    this.color = 'grey'
    this.size = 5
    this._dx = 0
    this._dr = 0
    this._x = 0
    this._r = 0
    this._align = 'middle'
    this._rotate = true
  }
  xBounds() {
    return {
      min: 0,
      max: this._x
    }
  }
  rBounds() {
    return {
      min: 0,
      max: this._r
    }
  }
  rotate(bool) {
    this._rotate = bool
    return this
  }
  at(x, r) {
    this._x = x
    this._r = r
    return this
  }
  dx(n) {
    this._dx = n
    return this
  }
  dr(n) {
    this._dr = n
    return this
  }
  font(n) {
    this.size = n
    return this
  }
  build() {
    let h = this.world.html

    let attrs = {
      x: this._dx,
      y: this._dr,
      fill: this.color,
      'text-anchor': this._align,
      'font-size': this.size
    }
    return h`<text ...${attrs}>${this.text}</text>`
  }
}
module.exports = Text
