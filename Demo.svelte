<script>
  import { Round, Arc, Line, Label, Circle, Arrow } from './src'
  let w = 20
  setInterval(() => {
    console.log('change')
    w = Math.random() * 200 + 20
  }, 1000)
</script>

<div class="col">
  <div class="h3">
    <a
      style="color:steelblue; font-size:20px;"
      href="https://github.com/spencermountain/somehow-circle"
    >
      somehow-circle
    </a>
  </div>
  <div class="container">
    <Round rotate="0" margin="40">
      <Arrow from="15" to={w} color="rose" width="5" />
      <Arc from="195" to="345" color="green" width="5" />
      <Circle color="greypurple" width="1" radius="19" />
      <Line color="greypurple" width="1" radius="19" angle={20} />
      <Label angle="0" radius="110" text="left side" color="grey" size="4" />
      <Label angle="180" radius="90" text="right side" color="grey" size="4" />
    </Round>
  </div>
</div>

<style>
  .container {
    width: 50%;
    border: 1px solid grey;
  }
</style>
