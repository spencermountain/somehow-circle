<script>
  import { Round, Arc, Line, Label, Circle } from './src'
</script>

<style>

</style>

<div class="col">
  <div class="h3">
    <a
      style="color:steelblue; font-size:20px;"
      href="https://github.com/spencermountain/somehow-circle">
      somehow-circle
    </a>
  </div>
  <div style="width:50%; left:10%;">
    <Round rotate="0" margin="10">
      <Arc from="-45" to="45" color="blue" width="8" />
      <Arc from="-10" to="-5" color="red" width="8" />
      <Circle radius="73" />
      <Line length="70" angle="30" />
      <Label angle="32" radius="68" text="30°" color="grey" size="8" />
    </Round>
  </div>
</div>
