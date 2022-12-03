import { writable } from 'svelte/store'
export default writable({
  maxR: 0,
  rotate: 0,
  world: {},
  q: Math.PI / 2,
})
// export default world