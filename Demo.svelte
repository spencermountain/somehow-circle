<script>
  import { Round, Arc, Line, Label, Circle, Arrow } from './src'
</script>

<style>
  .container {
    width: 50%;
    border: 1px solid grey;
  }
</style>

<div class="col">
  <div class="h3">
    <a
      style="color:steelblue; font-size:20px;"
      href="https://github.com/spencermountain/somehow-circle">
      somehow-circle
    </a>
  </div>
  <div class="container">
    <Round rotate="0" margin="40">
      <Arrow from="15" to="155" color="rose" width="5" />
      <Arrow from="195" to="345" color="rose" width="5" />
      <!-- <Label angle="180" radius="90" text="UI" color="grey" size="4" /> -->
      <!-- <Label angle="0" radius="110" text="Arcane CLI" color="grey" size="4" /> -->
    </Round>
  </div>
</div>
