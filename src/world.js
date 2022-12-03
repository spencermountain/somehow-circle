import { writable } from 'svelte/store'
export default writable({
  maxR: 0,
  rotate: 0,
  world: {
    radius: 0,
    rotate: 0,
    from: 0,
    to: 0,
    margin: 0,
  },
  q: Math.PI / 2,
})
// export default world