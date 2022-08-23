import * as Bun from 'bun'
import { corsModule, TCorsOptions } from '../utility/cors'
import findRoute from '../utility/findRoute'
import logging from '../utility/logging'
import {
  IMethodDirectory,
  IPathObj,
  setExecutions,
  TExecutions,
  TMethods,
  TRouteCbFunction,
  TRouteErrorCbFunction,
} from '../utility/routeHelpers'
import { groupParamsByKey } from '../utility/searchparams'
import { ChopNext } from './next'
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
  private order = 0
  private notFoundExec: TRouteCbFunction[] = notFoundExecFallback
  private pathDirectory = new Map<string, IMethodDirectory>()
  private useDirectory = new Map<string, IPathObj>()

  // TODO add default error function
  private errorFn: TRouteErrorCbFunction = null

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

  use(pathOrExecutions: string | TExecutions, executions?: TExecutions) {
    const selectedPath =
      typeof pathOrExecutions === 'string' ? pathOrExecutions : '(.*)'
    const selectedExecutions =
      typeof pathOrExecutions === 'string' ? executions : pathOrExecutions

    this.order += 1

    this.useDirectory.set(selectedPath, {
      order: this.order,
      executions: setExecutions(selectedExecutions),
    })
  }

  error(executionFn: TRouteErrorCbFunction) {
    this.errorFn = executionFn
  }

  cors(o?: TCorsOptions | Function) {
    // if options are static (either via defaults or custom options passed in), wrap in a function
    let optionsCallback = null

    if (typeof o === 'function') {
      optionsCallback = o
    } else {
      optionsCallback = (_, cb: Function) => {
        cb(null, o)
      }
    }

    corsModule(optionsCallback)
  }

  private updatePathDirectory(
    path: string,
    executions: TExecutions,
    methods: TMethods[]
  ) {
    const pathExists = this.pathDirectory.get(path)
    const executionsToSet = setExecutions(executions)

    this.order += 1

    if (pathExists) {
      Object.keys(pathExists).forEach((method) => {
        if (pathExists[method]?.executions?.length) {
          pathExists[method] = {
            order: this.order,
            executions: (pathExists[method] as IPathObj).executions.concat(
              executionsToSet
            ),
          }
        } else {
          pathExists[method] = {
            order: this.order,
            executions: executionsToSet,
          }
        }
      })
    } else {
      const methodsToSet = {}

      methods.forEach((method) => {
        methodsToSet[method] = {
          order: this.order,
          executions: executionsToSet,
        }
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
      this.pathDirectory,
      this.useDirectory
    )

    console.log(route)

    let req = chopRequest(bunReq, urlSearchParamsAsObj, route)
    let res = new ChopResponse()

    const routeExecArr = route ? route.matchExecArr : this.notFoundExec

    let nextClass = new ChopNext()

    try {
      routeExecArr.forEach((routeFn) => {
        if (nextClass.error) {
          throw nextClass.error
        }

        routeFn(req, res, nextClass.next) as TRouteCbFunction
      })
    } catch (e) {
      this.errorFn(e, req, res)
    }

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
