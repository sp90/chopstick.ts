import * as Bun from 'bun'
import { pathToRegexp } from '../path-to-regex-temp/index'
import findRoute from '../utility/findRoute'
import logging from '../utility/logging'
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
  port: string | number
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

  // TODO - if no path, apply to all and
  // TODO - map all paths to an array and find matching path's
  use(pathOrExecutions: string | TExecutions, executions?: TExecutions) {
    const selectedPath =
      typeof pathOrExecutions === 'string' ? pathOrExecutions : '(.*)'
    const selectedExecutions =
      typeof pathOrExecutions === 'string' ? executions : pathOrExecutions

    const pathArr = Object.keys(pathDirectory)
    const pathArrToExecuteOn = pathArr.filter((matchingPath) =>
      pathToRegexp(selectedPath).exec(matchingPath)
    )

    console.log(pathArrToExecuteOn)

    pathArrToExecuteOn.forEach((path: string) => {
      const pathConfig = pathDirectory[path]
      const pathConfigArr = Object.keys(pathConfig)

      console.log(selectedExecutions)

      pathConfigArr.forEach((key) => {
        if (typeof selectedExecutions === 'function') {
          pathConfig[key].unshift(selectedExecutions)
        } else {
          selectedExecutions.concat(pathConfig[key])
        }
      })
    })
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
    logging.init()

    const _self = this

    logging.info(`🥢 on port ${options.port}`)
    // logging.message(pathDirectory as any)

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
}
