<script>
  import { lines } from './stores.js'
  import colors from './lib/colors'
  export let angle = 0
  export let length = 40
  export let radius = 0
  export let width = 0.1

  export let color = 'grey'
  color = colors[color] || color

  lines.update(arr => {
    arr.push({
      color: color,
      angle: Number(angle),
      radius: Number(radius),
      length: Number(length),
      width: Number(width)
    })
    return arr
  })
</script>

<div />
