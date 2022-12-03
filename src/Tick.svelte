<script>
  import getScales from './layout/scales.js'
  import drawTicks from './layout/drawTicks.js'
  import colors from './lib/colors'
  import { afterUpdate } from 'svelte'
  export let radius = 80

  export let color = 'blue'
  color = colors[color] || color

  $: res = {}
  afterUpdate(() => {
    let obj = {
      text: text,
      color: color,
      align: align,
      angle: Number(angle),
      radius: Number(radius),
      size: Number(size),
      rotate: Number(rotate)
    }
    let { xScale, rScale } = getScales(obj)
    res = drawTicks(obj, xScale, rScale)
  })
</script>

<text
  x={res.x}
  y={res.y}
  transform="rotate({res.angle},{res.x},{res.y})"
  font-size={res.size}
  text-anchor={res.align}
  fill={res.color}
>
  {@html res.text}
</text>
