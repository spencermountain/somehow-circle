class Text {
  constructor(txt = '', world) {
    this.world = world
    this.attrs = {}
    this.text = txt
    this.color = 'grey'
    this.size = 5
    this._dx = 0
    this._dy = 0
    this._align = 'middle'
  }
  dx(n) {
    this._dx = n
    return this
  }
  dy(n) {
    this._dy = n
    return this
  }
  font(n) {
    this.size = n
    return this
  }
  build() {
    let h = this.world.html

    let attrs = {
      x: '0',
      y: '0',
      fill: this.color,
      'text-anchor': this._align,
      'font-size': this.size
    }
    return h`<text ...${attrs}>${this.text}</text>`
  }
}
module.exports = Text
