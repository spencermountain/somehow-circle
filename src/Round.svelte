<script>
  import { writable } from 'svelte/store'

  import { setContext, onMount } from 'svelte'
  import scale from './lib/scale'
  import colors from './lib/colors'
  import layout from './layout'
  import { items } from './stores.js'

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
    shapes = layout($items, world)
  })

  // rotate = writable(rotate)
  console.log(rotate)
  rotate.subscribe(val => {
    console.log(val)
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
      <path class="link" d={o.path} stroke="none" fill={o.color} style="" stroke-width={1} />
    {/each}
  </svg>
  <!-- {#each shapes as o}
    {#if o.label}
      <div style="color:white;">hiiiiiii</div>
    {/if}
  {/each} -->
</div>
<slot />
