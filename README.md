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

a version of [somehow](https://github.com/spencermountain/somehow) that has two scales - a round one, and a radial one.
This lets you easily plot data into a pie-chart-like form, and automatically fit the scales to the data, and responsively fit the graph to the page.

`npm i somehow-circle`

```js
const somehowCircle = require('somehow-circle')
let w = somehowCircle()

// simple circle
w.circle().radius(50)

// simple arcs
w.arc()
  .from(0)
  .to(20)
  .radius(10)
  .color('green')
  .width(5)
w.arc()
  .from(0)
  .to(25)
  .color('red')
  .radius(20)
  .width(10)

// complex, wavey line
let data = [
  { x: 3, r: 2 },
  { x: 13, r: 22 },
  { x: 23, r: 12 },
  { x: 33, r: 12 },
  { x: 53, r: 19 },
  { x: 63, r: 22 },
  { x: 73, r: 12 }
]
w.line()
  .set(data)
  .width(5)
  .opacity(0.5)

// some labels
w.label('95%')
  .at(95)
  .min(10)
w.label('25%')
  .at(25)
  .min(10)
w.label('50%')
  .at(50)
  .min(10)

// w.rotate(90)

w.fit()
w.xScale.fit(0, 100)

document.body.innerHTML = w.build()
```

![image](https://user-images.githubusercontent.com/399657/66593813-befd3400-eb65-11e9-9397-2bc92214ee5d.png)


running `.build()` returns html-strings by default, but the library uses Jason Miller's [htm](https://github.com/developit/htm) library so can call `.bind(React.createElement)` and return React Components.

work-in-progress!

### See also
* [somehow-input](https://github.com/spencermountain/somehow-input)
* [somehow-ticks](https://github.com/spencermountain/somehow-ticks)
* [somehow-calendar](https://github.com/spencermountain/somehow-calendar)
* [somehow-maps](https://github.com/spencermountain/somehow-maps)
* 
MIT