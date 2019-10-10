const somehowCircle = require('./src')
let w = somehowCircle({})

let data = [
  { x: 3, r: 2 },
  { x: 13, r: 22 },
  { x: 23, r: 12 },
  { x: 33, r: 12 },
  { x: 53, r: 19 },
  { x: 63, r: 22 },
  { x: 73, r: 12 }
  // { x: 83, r: 12 }
]
w.line()
  .set(data)
  .width(5)
  .opacity(0.5)
w.circle().radius(50)

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

// w.text('hello')
w.fit()

// console.log(w.xScale(80))
w.xScale.fit(0, 100)
// console.log(w.xScale(80))

document.querySelector('#stage').innerHTML = w.build()
