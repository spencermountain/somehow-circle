import scale from '../lib/scale'
import w from '../world.js'
import { get } from 'svelte/store'

const trig = [-Math.PI, Math.PI]

const maxRadius = function (o) {
  let max = 0
  let r = o.radius + o.width
  if (r > max) {
    max = r
  }
  return max
}

const makeScales = function (o) {
  let world = get(w)
  let xScale = scale({ minmax: [world.from, world.to], world: trig })

  let max = maxRadius(o)
  max = max + world.margin
  if (max > world.maxR) {
    w.update((wo) => {
      wo.maxR = max
      return wo
    })
  }
  let rScale = scale({ minmax: [0, world.maxR], world: [0, 50] })
  return { xScale, rScale }
}
export default makeScales
