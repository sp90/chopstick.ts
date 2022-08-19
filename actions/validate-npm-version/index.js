const core = require('@actions/core')
const github = require('@actions/github')
const { execSync } = require('child_process')
const packageJson = require('../../package.json')

try {
  const packageName = core.getInput('package-name')

  const oldVersion = execSync(`npm show ${packageName} version`)
  console.log('Old version: ', oldVersion)

  const newVersion = packageJson.version

  console.log('New version: ', newVersion)
} catch (error) {
  core.setFailed(error.message)
}

function breakVersion() {}
