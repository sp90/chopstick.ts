import { TExecutionFns, TRouteCbObj } from './routeHelpers'

let executionOrder = 0

export const setExecutions = (executions: TExecutionFns): TRouteCbObj[] => {
  if (typeof executions === 'function') {
    executionOrder += 1

    return [
      {
        order: executionOrder,
        cb: executions,
      },
    ]
  }

  return executions.map((cb) => {
    executionOrder += 1

    return {
      order: executionOrder,
      cb,
    }
  })
}
