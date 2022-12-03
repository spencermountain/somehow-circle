<script>
  import getScales from './layout/scales.js'
  import colors from './lib/colors'
  import drawLine from './layout/drawLines.js'
  import { afterUpdate } from 'svelte'
  export let radius = 80
  export let width = 20

  export let color = 'blue'
  color = colors[color] || color

  $: res = {}
  afterUpdate(() => {
    let obj = {
      color: color,
      angle: Number(angle),
      radius: Number(radius),
      length: Number(length),
      width: Number(width)
    }
    let { xScale, rScale } = getScales(obj)
    res = drawLine(obj, xScale, rScale)
  })
</script>

<path
  class="link"
  d={res.path}
  stroke={res.color}
  fill={res.color}
  style=""
  stroke-width={res.width}
/>
