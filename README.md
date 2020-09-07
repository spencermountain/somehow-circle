<div align="center">
  <div><b>somehow-circle</b></div>
  <img src="https://user-images.githubusercontent.com/399657/68222691-6597f180-ffb9-11e9-8a32-a7f38aa8bded.png"/>
  <div>— part of <a href="https://github.com/spencermountain/somehow">somehow</a> —</div>
  <div>WIP svelte infographics</div>
  <div align="center">
    <sub>
      by
      <a href="https://spencermounta.in/">Spencer Kelly</a> 
    </sub>
  </div>
</div>
<div align="right">
  <a href="https://npmjs.org/package/somehow-circle">
    <img src="https://img.shields.io/npm/v/somehow-circle.svg?style=flat-square" />
  </a>
</div>
<img height="25px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

**work in progress**

a **svelte** component to draw circular infographics.

- a version of [somehow](https://github.com/spencermountain/somehow) that has two scales - a round one, and a radial one.
  This lets you easily plot data into a pie-chart-like form, and automatically fit the scales to the data, and responsively fit the graph to the page.

`npm i somehow-circle`

```html
<script>
  import { Round, Arc, Circle, Line, Label } from 'somehow-circle'
</script>

<Round rotate="0" margin="10">
  <Arc from="-45" to="45" color="blue" width="8" />
  <Arc from="-10" to="-5" color="red" width="8" />
  <Circle radius="73" />
  <Line length="70" angle="30" />
  <label angle="32" radius="68" text="30°" color="grey" size="8" />
</Round>
```

![image](https://user-images.githubusercontent.com/399657/92408329-2bccd580-f10b-11ea-80f2-774d41cb5daf.png)

the svg will resize responsively to fit your container.

work-in-progress!

### See also

- [somehow-input](https://github.com/spencermountain/somehow-input)
- [somehow-ticks](https://github.com/spencermountain/somehow-ticks)
- [somehow-calendar](https://github.com/spencermountain/somehow-calendar)
- [somehow-maps](https://github.com/spencermountain/somehow-maps)

MIT
