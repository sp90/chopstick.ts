let appVerbosity = -1

export default {
  init: () => {
    if (process.env.VERBOSE) {
      appVerbosity = parseInt(process.env.VERBOSE)
    }
  },
  info: (message: string) => {
    appVerbosity >= 0 && console.log(message)
  },
  message: (message: string) => {
    appVerbosity >= 1 && console.log(message)
  },
  warn: (message: string) => {
    appVerbosity >= 2 && console.log(message)
  },
  error: (message: string) => {
    appVerbosity >= 3 && console.log(message)
  },
}
