<script>
  import { getContext } from 'svelte'
  import { arcs } from './stores.js'
  import colors from './lib/colors'
  export let to = 0
  export let from = 360
  export let radius = 80
  export let width = 1
  to = Number(to)
  from = Number(from)
  radius = Number(radius)
  width = Number(width)

  export let color = 'blue'
  color = colors[color] || color

  arcs.update(arr => {
    arr.push({
      color: color,
      to: to,
      from: from,
      radius: radius,
      width: width
    })
    return arr
  })
</script>

<div />
