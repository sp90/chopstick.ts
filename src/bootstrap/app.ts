import * as Bun from 'bun'
import findRoute from '../utility/findRoute'
import logging from '../utility/logging'
import {
  IMethodDirectory,
  setExecutions,
  TExecutions,
  TMethods,
  TRouteCbFunction,
} from '../utility/routeHelpers'
import { groupParamsByKey } from '../utility/searchparams'
import { chopRequest } from './request'
import { ChopResponse } from './response'

const notFoundExecFallback = [
  (_, res) => {
    return res.status(404).json({
      message: 'Route was not found',
    })
  },
]

export default class Chop {
  private itemCount = 0
  private notFoundExec: TRouteCbFunction[] = notFoundExecFallback
  private pathDirectory = new Map<string, IMethodDirectory>()

  constructor() {}

  get(path: string, executions: TExecutions) {
    this.updatePathDirectory(path, executions, ['GET'])
  }

  put(path: string, executions: TExecutions) {
    this.updatePathDirectory(path, executions, ['PUT'])
  }

  patch(path: string, executions: TExecutions) {
    this.updatePathDirectory(path, executions, ['PATCH'])
  }

  post(path: string, executions: TExecutions) {
    this.updatePathDirectory(path, executions, ['POST'])
  }

  delete(path: string, executions: TExecutions) {
    this.updatePathDirectory(path, executions, ['DELETE'])
  }

  all(path: string, executions: TExecutions) {
    this.updatePathDirectory(path, executions, [
      'GET',
      'DELETE',
      'PATCH',
      'POST',
      'PUT',
    ])
  }

  use(path: string, executions: TExecutions) {
    this.updatePathDirectory(path, executions, [
      'GET',
      'DELETE',
      'PATCH',
      'POST',
      'PUT',
    ])
  }

  private updatePathDirectory(
    path: string,
    executions: TExecutions,
    methods: TMethods[]
  ) {
    const pathExists = this.pathDirectory.get(path)
    const executionsToSet = setExecutions(executions)

    if (pathExists) {
      Object.keys(pathExists).forEach((method) => {
        if (pathExists[method]) {
          pathExists[method] = pathExists[method].concat(executionsToSet)
        } else {
          pathExists[method] = executionsToSet
        }
      })
    } else {
      const methodsToSet = {}

      methods.forEach((method) => {
        methodsToSet[method] = executionsToSet
      })

      this.pathDirectory.set(path, methodsToSet)
    }
  }

  notFound(executions: TExecutions) {
    this.notFoundExec = setExecutions(executions)
  }

  _dispatchEvent(bunReq: Request) {
    logging.message(`${bunReq.url}`)

    const urlInstance = new URL(bunReq.url)
    const urlSearchParamsAsObj = groupParamsByKey(urlInstance.searchParams)
    const route = findRoute(
      bunReq.method as TMethods,
      urlInstance.pathname,
      this.pathDirectory
    )

    let req = chopRequest(bunReq, urlSearchParamsAsObj, route)
    let res = new ChopResponse()

    const routeExecArr = route ? route.matchExecArr : this.notFoundExec

    routeExecArr.forEach((eachCall) => {
      eachCall(req, res) as TRouteCbFunction
    })

    return res.bunRes()
  }

  listen(port: number, cb?: Function) {
    const _self = this

    logging.init()
    logging.info(`🥢 on port ${port}`)
    // logging.message(this.pathDirectory as any)

    Bun.serve({
      port: port || process.env.PORT || 3000,
      async fetch(req: Request) {
        return _self._dispatchEvent(req)
      },
      error(error: Error) {
        console.log(error)

        return new Response('Uh oh!!\n' + error.toString(), { status: 500 })
      },
    })

    if (cb && typeof cb === 'function') {
      cb(null)
    }
  }
}
