<script>
  import { Round, Arc } from './src'
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'
  const rotate = tweened(0, {
    duration: 400,
    easing: cubicOut
  })
  // let rotate = 0
</script>

<style>

</style>

<div class="col">

  <div>
    <a href="https://github.com/spencermountain/somehow-circle">somehow-circle</a>
  </div>
  <!-- <button on:click={() => rotate.set(180)}>spin</button> -->
  <div class="w8">
    <Round {$rotate} margin="10">
      <Arc from="-45" to="45" color="blue" width="8" />
      <Arc from="135" to="225" color="orange" width="8" />
      <!-- <Arc from="90" to="180" color="red" width="10" radius="50" label="red" /> -->
      <!-- <Arc from="180" to="280" color="green" /> -->
    </Round>
  </div>
</div>
