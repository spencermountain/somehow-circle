<div align="center">
  <div>somehow-circle</div>
  <img src="https://cloud.githubusercontent.com/assets/399657/23590290/ede73772-01aa-11e7-8915-181ef21027bc.png" />
  <div><a href="https://spencermounta.in/somehow-circle/">demo</a></div>
  <a href="https://npmjs.org/package/somehow-circle">
    <img src="https://img.shields.io/npm/v/somehow-ticks.svg?style=flat-square" />
  </a>
  <a href="https://unpkg.com/somehow-circle">
    <img src="https://badge-size.herokuapp.com/spencermountain/somehow-ticks/master/builds/somehow-circle.min.js" />
  </a>
</div>

**work in progress**

a **svelte** component to draw circular infographics.

- a version of [somehow](https://github.com/spencermountain/somehow) that has two scales - a round one, and a radial one.
This lets you easily plot data into a pie-chart-like form, and automatically fit the scales to the data, and responsively fit the graph to the page.

`npm i somehow-circle`

```html
<script>
import { Round, Arc } from 'somehow-circle'
</script>

<div style="width:30rem; height:30rem;">
  <Round>
    <Arc from="0" to="90" color="blue" />
    <Arc from="90" to="180" color="red" width="10" radius="50" />
    <Arc from="180" to="280" color="green" />
  </Round>
</div>
```

the svg will resize responsively to fit your container.

work-in-progress!

### See also
* [somehow-input](https://github.com/spencermountain/somehow-input)
* [somehow-ticks](https://github.com/spencermountain/somehow-ticks)
* [somehow-calendar](https://github.com/spencermountain/somehow-calendar)
* [somehow-maps](https://github.com/spencermountain/somehow-maps)
  
MIT