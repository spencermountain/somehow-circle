<script>
  import getScales from './layout/scales.js'
  import colors from './lib/colors'
  import { afterUpdate } from 'svelte'
  import drawLabel from './layout/drawLabels.js'
  export let angle = 0
  export let at = 0
  angle = angle || at
  export let radius = 0
  export let rotate = 0
  export let size = 1.5
  export let align = 'left'
  export let text = ''

  export let color = 'grey'
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
    res = drawLabel(obj, xScale, rScale)
  })
</script>

<text
  x={res.x}
  y={res.y}
  transform="rotate({res.angle || 0},{res.x || 0},{res.y || 0})"
  font-size={res.size}
  text-anchor={res.align}
  fill={res.color}
>
  {@html res.text}
</text>
