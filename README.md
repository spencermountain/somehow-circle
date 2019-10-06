a version of [somehow](https://github.com/spencermountain/somehow) that has two scales - a round one, and a radial one.
This lets you easily plot data into a pie-chart-like form, and automatically fit the scales to the data, and responsively fit the graph to the page.

`npm i somehow-circle`

```js
const somehowCircle = require('somehow-circle')
let world = somehowCircle({
  rotate:-90,
  max:180
})

// draw a squiggly-line
w.line().set([
  [3,25],
  [5,45],
  [8,35],
  [9,55],
  [12,35],
  [15,45],
])
// draw a reference circle
w.circle().radius(50)
// a typical pie-chart
w.arc().from(25).to(50)

w.fit()
document.querySelector('#stage').innerHTML = w.build()
```

running `.build()` returns html-strings by default, but the library uses Jason Miller's [htm](https://github.com/developit/htm) library so can call `.bind(React.createElement)` and return React Components.

work-in-progress!

### See also
* [somehow-input](https://github.com/spencermountain/somehow-input)
* [somehow-ticks](https://github.com/spencermountain/somehow-ticks)
* [somehow-calendar](https://github.com/spencermountain/somehow-calendar)
* [somehow-maps](https://github.com/spencermountain/somehow-maps)
* 
MIT