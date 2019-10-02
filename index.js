const somehowCircle = require('./src')
let w = somehowCircle({})
w.line()
w.circle()
w.text('hello')

document.querySelector('#stage').innerHTML = w.build()
