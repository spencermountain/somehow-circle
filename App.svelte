<script>
  import { Round, Arc, Line, Ticks } from './src'
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
  <div class="w8">
    <Round rotate="0" margin="10">
      <Arc from="-45" to="45" color="blue" width="8" />
      <Arc from="135" to="225" color="orange" width="8" />
      <Arc from="-10" to="-5" color="red" width="8" />
      <Line length="70" />
      <Ticks from="-45" to="45" radius="70" />
    </Round>
  </div>
</div>
