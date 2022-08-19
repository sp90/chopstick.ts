const core = require('@actions/core')
const { execSync } = require('child_process')
const semver = require('semver')
const packageJson = require('../../package.json')

try {
  const packageName = core.getInput('package-name')
  const oldVersion = execSync(`npm show ${packageName} version`).toString()
  const newVersion = packageJson.version
  const isNewer = semver.gt(oldVersion, newVersion)

  isNewer
    ? core.setCommandEcho('Version is newer')
    : core.setFailed('Same or older version')
} catch (error) {
  core.setFailed(error.message)
}
