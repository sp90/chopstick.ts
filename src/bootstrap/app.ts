import * as Bun from 'bun'
import findRoute from '../utility/findRoute'
import {
  IPathDirectory,
  setExecutions,
  TExecutions,
  TMethods,
  TRouteCbFunction,
} from '../utility/routeHelpers'
import { groupParamsByKey } from '../utility/searchparams'
import { chopRequest } from './request'
import { ChopResponse } from './response'

const pathDirectory: IPathDirectory = {}

export interface IChopListenOptions {
  port: number
}

const notFoundExecFallback = [
  (_, res) => {
    return res.status(404).json({
      message: 'Route was not found',
    })
  },
]

export default class Chop {
  private notFoundExec: TRouteCbFunction[] = notFoundExecFallback

  constructor() {}

  get(path: string, executions: TExecutions) {
    pathDirectory[path] = {
      GET: setExecutions(executions),
    }
  }

  put(path: string, executions: TExecutions) {
    pathDirectory[path] = {
      PUT: setExecutions(executions),
    }
  }

  patch(path: string, executions: TExecutions) {
    pathDirectory[path] = {
      PATCH: setExecutions(executions),
    }
  }

  post(path: string, executions: TExecutions) {
    pathDirectory[path] = {
      POST: setExecutions(executions),
    }
  }

  delete(path: string, executions: TExecutions) {
    pathDirectory[path] = {
      DELETE: setExecutions(executions),
    }
  }

  all(path: string, executions: TExecutions) {
    pathDirectory[path] = {
      GET: setExecutions(executions),
      PUT: setExecutions(executions),
      PATCH: setExecutions(executions),
      POST: setExecutions(executions),
      DELETE: setExecutions(executions),
    }
  }

  // Todo if no path, apply to all and
  use(path: string, executions: TExecutions) {
    const pathConfig = pathDirectory[path]
    const objectKeys = Object.keys(pathConfig)

    objectKeys.forEach((key) => {
      if (typeof executions === 'function') {
        pathConfig[key].push(executions)
      } else {
        pathConfig[key].concat(executions)
      }
    })
  }

  notFound(executions: TExecutions) {
    this.notFoundExec = setExecutions(executions)
  }

  _dispatchEvent(bunReq: Request) {
    const urlInstance = new URL(bunReq.url)
    const urlSearchParamsAsObj = groupParamsByKey(urlInstance.searchParams)
    const route = findRoute(
      bunReq.method as TMethods,
      urlInstance.pathname,
      pathDirectory
    )

    let req = chopRequest(bunReq, urlSearchParamsAsObj, route)
    let res = new ChopResponse()

    const routeExecArr = route ? route.matchExecArr : this.notFoundExec

    routeExecArr.forEach((eachCall) => {
      eachCall(req, res) as TRouteCbFunction
    })

    return res.bunRes()
  }

  listen(options: IChopListenOptions = { port: 3000 }) {
    const _self = this

    console.log(`🥢 on port ${options.port}`)

    Bun.serve({
      async fetch(req: Request) {
        const event = _self._dispatchEvent(req)

        return event
      },
      error(error: Error) {
        return new Response('Uh oh!!\n' + error.toString(), { status: 500 })
      },
    })
  }

  _getAppStructure(): IPathDirectory {
    return JSON.parse(JSON.stringify(pathDirectory))
  }
}
