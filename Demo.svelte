<script>
  import { Round, Arc, Line, Label, Circle, Arrow } from './src'
  let w = 20
  setInterval(() => {
    console.log('change')
    w = Math.random() * 200
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
      <Arrow from="195" to="345" color="green" width="5" />
      <Label angle="180" radius="90" text="UI" color="grey" size="4" />
      <Label angle="0" radius="110" text="Arcane CLI" color="grey" size="4" />
    </Round>
  </div>
</div>

<style>
  .container {
    width: 50%;
    border: 1px solid grey;
  }
</style>
