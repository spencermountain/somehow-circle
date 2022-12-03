<script>
  import getScales from './layout/scales.js'
  import colors from './lib/colors'
  import drawLine from './layout/drawLines.js'
  import { afterUpdate } from 'svelte'
  export let angle = 0
  export let at = 0
  angle = angle || at
  export let length = 40
  export let radius = 0
  export let width = 0.1

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
