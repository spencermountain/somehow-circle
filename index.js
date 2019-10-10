const somehowCircle = require('./src')
let w = somehowCircle({})

// let data = [
//   { x: 3, r: 2 },
//   { x: 13, r: 22 },
//   { x: 23, r: 42 },
//   { x: 33, r: 12 },
//   { x: 53, r: 99 },
//   { x: 63, r: 22 },
//   { x: 73, r: 92 }
//   // { x: 83, r: 12 }
// ]
// w.line().set(data)
w.circle()
  .radius(50)
  .width(5)
// w.arc()
w.label('50%').at(8)
// w.text('hello')
w.fit()

document.querySelector('#stage').innerHTML = w.build()
