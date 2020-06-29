<script>
  import { labels } from './stores.js'
  import colors from './lib/colors'
  export let angle = 0
  export let radius = 0
  export let size = 1.5
  export let align = 'left'
  export let text = ''

  export let color = 'grey'
  color = colors[color] || color

  labels.update(arr => {
    arr.push({
      text: text,
      color: color,
      align: align,
      angle: Number(angle),
      radius: Number(radius),
      size: Number(size)
    })
    return arr
  })
</script>

<div />
