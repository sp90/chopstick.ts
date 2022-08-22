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
  private notFoundExec: TRouteCbFunction[] = notFoundExecFallback
  private useDirectory = new Map<string, TRouteCbFunction[]>()
  private pathDirectory = new Map<string, IMethodDirectory>()

  constructor() {}

  get(path: string, executions: TExecutions) {
    this.pathDirectory.set(path, {
      GET: setExecutions(executions),
    })
  }

  put(path: string, executions: TExecutions) {
    this.pathDirectory.set(path, {
      PUT: setExecutions(executions),
    })
  }

  patch(path: string, executions: TExecutions) {
    this.pathDirectory.set(path, {
      PATCH: setExecutions(executions),
    })
  }

  post(path: string, executions: TExecutions) {
    this.pathDirectory.set(path, {
      POST: setExecutions(executions),
    })
  }

  delete(path: string, executions: TExecutions) {
    this.pathDirectory.set(path, {
      DELETE: setExecutions(executions),
    })
  }

  all(path: string, executions: TExecutions) {
    this.pathDirectory.set(path, {
      GET: setExecutions(executions),
      PUT: setExecutions(executions),
      PATCH: setExecutions(executions),
      POST: setExecutions(executions),
      DELETE: setExecutions(executions),
    })
  }

  use(pathOrExecutions: string | TExecutions, executions?: TExecutions) {
    const selectedPath =
      typeof pathOrExecutions === 'string' ? pathOrExecutions : '(.*)'
    const selectedExecutions =
      typeof pathOrExecutions === 'string' ? executions : pathOrExecutions

    const pathExists = this.useDirectory.get(selectedPath)

    if (pathExists) {
      this.useDirectory.set(
        selectedPath,
        pathExists.concat(setExecutions(selectedExecutions))
      )
    } else {
      this.useDirectory.set(selectedPath, setExecutions(selectedExecutions))
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
      this.pathDirectory,
      this.useDirectory
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
        return new Response('Uh oh!!\n' + error.toString(), { status: 500 })
      },
    })

    if (cb && typeof cb === 'function') {
      cb(null)
    }
  }
}
