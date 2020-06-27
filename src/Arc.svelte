<script>
  import { getContext } from 'svelte'
  import { items } from './stores.js'
  import colors from './lib/colors'
  export let to = 90
  export let from = 0
  export let radius = 20
  export let width = 20
  to = Number(to)
  from = Number(from)
  radius = Number(radius)
  width = Number(width)

  export let color = 'blue'
  color = colors[color] || color

  items.update(arr => {
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
