<script>
  import getScales from './layout/scales.js'
  import drawArc from './layout/drawArcs.js'
  import colors from './lib/colors'
  import { afterUpdate } from 'svelte'
  export let to = 90
  export let from = 0
  export let radius = 80
  export let width = 20

  export let color = 'blue'
  color = colors[color] || color

  $: res = {}
  afterUpdate(() => {
    let obj = {
      color: color,
      to: Number(to),
      from: Number(from),
      radius: Number(radius),
      width: Number(width)
    }
    let { xScale, rScale } = getScales(obj)
    res = drawArc(obj, xScale, rScale)
  })
</script>

<path class="link" d={res.path} stroke="none" fill={color} style="" stroke-width={1} />
