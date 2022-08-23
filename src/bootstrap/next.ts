export class ChopNext {
  error = null

  constructor() {}

  next(error: Error | null | undefined) {
    if (error !== null && error !== undefined) {
      this.error = error

      return error
    }

    return null
  }
}
