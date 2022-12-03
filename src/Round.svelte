<script>
  import world from './world.js'

  export let radius = 500
  export let rotate = 0
  export let from = 0
  export let to = 360
  export let margin = 0
  radius = Number(radius)

  world.update((obj) => {
    obj.radius = radius
    obj.rotate = Number(rotate)
    obj.from = Number(from)
    obj.to = Number(to)
    obj.margin = Number(margin)
    return obj
  })
</script>

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
        orient="auto"
      >
        <path d="M 0 0 L 10 4 L 0 10 z" fill="#D68881" transform="rotate(23)" />
      </marker>
    </defs>

    <slot />
  </svg>
</div>

<style>
  path {
    pointer-events: all;
  }
  path:hover {
    filter: drop-shadow(0px 1px 1px steelblue);
  }
</style>
