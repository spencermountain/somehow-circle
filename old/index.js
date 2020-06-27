const World = require('./World')
// const version = require('../_version')

// ...people call this a 'factory'
const somehowCircle = function(obj) {
  return new World(obj)
}
// somehow.version = version
module.exports = somehowCircle
