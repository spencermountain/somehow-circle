<script>
  import { setContext, onMount } from 'svelte'
  import scale from './lib/scale'
  import colors from './lib/colors'
  import layout from './layout'
  import { items } from './stores.js'

  export let radius = 500
  export let rotate = 0
  export let from = 0
  export let to = 365
  radius = Number(radius)
  let data = {
    radius: radius,
    rotate: Number(rotate),
    from: Number(from),
    to: Number(to)
  }

  let paths = []
  onMount(() => {
    paths = layout($items, data)
    console.log(paths)
  })
</script>

<style>
  svg {
    border: 1px solid grey;
  }
</style>

<svg viewBox="-50,-50,100,100" width={radius * 2} height={radius * 2}>
  {#each paths as p}
    <path class="link" d={p.path} stroke="none" fill={p.color} style="" stroke-width={1} />
  {/each}
</svg>
<slot />
