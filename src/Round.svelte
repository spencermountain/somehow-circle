<script>
  import { writable } from 'svelte/store'

  import { setContext, onMount } from 'svelte'
  import scale from './lib/scale'
  import colors from './lib/colors'
  import layout from './layout'
  import { arcs, lines, ticks } from './stores.js'

  export let radius = 500
  export let rotate = 0
  export let from = 0
  export let to = 360
  export let margin = 0
  radius = Number(radius)

  let world = {
    radius: radius,
    rotate: Number(rotate),
    from: Number(from),
    to: Number(to),
    margin: Number(margin)
  }
  let shapes = []
  onMount(() => {
    shapes = layout($arcs, $lines, $ticks, world)
    // console.log(shapes)
  })
</script>

<style>
  svg {
    border: 1px solid grey;
  }
</style>

<div class="container">
  <svg viewBox="-50,-50,100,100" width={radius * 2} height={radius * 2}>
    {#each shapes as o}
      {#if o.type === 'arc'}
        <path class="link" d={o.path} stroke="none" fill={o.color} style="" stroke-width={1} />
      {/if}
      {#if o.type === 'line'}
        <path
          class="link"
          d={o.path}
          stroke={o.color}
          fill={o.color}
          style=""
          stroke-width={o.width} />
      {/if}
      {#if o.type === 'ticks'}
        <path class="link" d={o.path} stroke="none" fill={o.color} style="" stroke-width={1} />
      {/if}
    {/each}
  </svg>

</div>
<slot />
