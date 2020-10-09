<script>
  import { onMount } from 'svelte'
  import layout from './layout'
  import { arcs, lines, labels, ticks, arrows } from './stores.js'

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
    shapes = layout($arcs, $lines, $labels, $ticks, $arrows, world)
    console.log(shapes)
  })
</script>

<style>
  path {
    pointer-events: all;
  }
  path:hover {
    filter: drop-shadow(0px 1px 1px steelblue);
  }
</style>

<div class="container">
  <svg viewBox="-50,-50,100,100" shape-rendering="geometricPrecision" width="100%" height="100%">

    <!-- arrow-head -->
    <defs>
      <marker
        id="triangle"
        viewBox="0 0 10 10"
        refX="4"
        refY="6"
        markerUnits="strokeWidth"
        markerWidth="9"
        markerHeight="9"
        orient="auto">
        <path d="M 0 0 L 10 4 L 0 10 z" fill="#D68881" transform="rotate(23)" />
      </marker>
    </defs>

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
      {#if o.type === 'label'}
        <text
          x={o.x}
          y={o.y}
          transform="rotate({o.angle},{o.x},{o.y})"
          font-size={o.size}
          text-anchor={o.align}
          fill={o.color}>
          {@html o.text}
        </text>
      {/if}
      {#if o.type === 'tick'}
        <text
          x={o.x}
          y={o.y}
          transform="rotate({o.angle},{o.x},{o.y})"
          font-size={o.size}
          text-anchor={o.align}
          fill={o.color}>
          {@html o.text}
        </text>
      {/if}
      {#if o.type === 'arrow'}
        <path
          class="link"
          d={o.path}
          stroke="none"
          fill={o.color}
          style=""
          stroke-width={1}
          marker-end="url(#triangle)" />
      {/if}
    {/each}
  </svg>

</div>
<slot />
