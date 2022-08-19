const core = require('@actions/core')
const github = require('@actions/github')
const packageJson = require('../../package.json')

try {
  const oldVersion = core.getInput('current-version')
  const newVersion = packageJson.version

  console.log('Old version: ', oldVersion)
  console.log('New version: ', newVersion)
} catch (error) {
  core.setFailed(error.message)
}

function breakVersion() {}
