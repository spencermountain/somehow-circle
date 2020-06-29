<script>
  import { Round, Arc, Line, Label, Circle } from './src'
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'
  const rotate = tweened(0, {
    duration: 400,
    easing: cubicOut
  })
</script>

<style>

</style>

<div class="col">

  <div>
    <a
      style="color:white; font-size:20px;"
      href="https://github.com/spencermountain/somehow-circle">
      somehow-circle
    </a>
  </div>
  <div style="width:80%; left:10%;">
    <Round rotate="0" margin="10">
      <Arc from="-45" to="45" color="blue" width="8" />
      <Arc from="135" to="225" color="orange" width="8" />
      <Arc from="-10" to="-5" color="red" width="8" />
      <Circle radius="70" />
      <Line length="70" />
      <Label angle="20" radius="70" text="foobar" color="white" />
      <Label angle="40" radius="70" text="foobar" color="white" />
      <Label angle="60" radius="70" text="foobar" color="white" />
    </Round>
  </div>
</div>
