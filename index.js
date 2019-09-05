'use strict'

const path = require('path')

module.exports = (robot) => {
  const scriptsPath = path.resolve(__dirname, 'scripts')
  robot.loadFile(scriptsPath, 'ssh2.js')
}
