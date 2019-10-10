//a very-tiny version of d3-scale's scaleLinear
const scaleLinear = function(obj) {
  let world = obj.world || []
  this.minmax = obj.minmax || []
  const calc = num => {
    let range = this.minmax[1] - this.minmax[0]
    let percent = (num - this.minmax[0]) / range
    let size = world[1] - world[0]
    return size * percent
  }
  // invert the calculation. return a %?
  calc.backward = num => {
    let size = world[1] - world[0]
    let range = this.minmax[1] - this.minmax[0]
    let percent = (num - world[0]) / size
    return percent * range
  }
  calc.fit = (a, b) => {
    if (b > this.minmax[1]) {
      this.minmax[1] = b
    }
    if (a < this.minmax[0]) {
      this.minmax[0] = a
    }
  }
  return calc
}
module.exports = scaleLinear

// let scale = scaleLinear({
//   world: [0, 300],
//   minmax: [0, 100]
// })
// console.log(scale(50))
// console.log(scale.backward(150))
