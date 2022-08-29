import * as Bun from 'bun'
import { corsModule, TCorsOptions } from '../utility/cors'
import exectionMap from '../utility/exectionMap'
import findRoute from '../utility/findRoute'
import logging from '../utility/logging'
import {
  IMethodDirectory,
  TExecutionFns,
  TMethods,
  TRouteCbFunction,
  TRouteCbObj,
  TRouteErrorCbFunction,
} from '../utility/routeHelpers'
import { groupParamsByKey } from '../utility/searchparams'
import { setExecutions } from '../utility/setExecutions'
import { ChopNext } from './next'
import { chopRequest } from './request'
import { ChopResponse, IHeaderObj } from './response'

export default class Chop {
  private defaultUserHeaders: IHeaderObj = null
  private pathDirectory = new Map<string, IMethodDirectory>()
  private useDirectory = new Map<string, TRouteCbObj[]>()
  private notFoundExec: TRouteCbObj[] = setExecutions((_, res) => {
    return res.status(404).json({
      message: 'Route was not found',
    })
  })

  // TODO add default error function
  private errorFn: TRouteErrorCbFunction = null

  constructor() {}

  get(path: string, executions: TExecutionFns) {
    this.updatePathDirectory(path, executions, ['GET'])
  }

  put(path: string, executions: TExecutionFns) {
    this.updatePathDirectory(path, executions, ['PUT'])
  }

  patch(path: string, executions: TExecutionFns) {
    this.updatePathDirectory(path, executions, ['PATCH'])
  }

  post(path: string, executions: TExecutionFns) {
    this.updatePathDirectory(path, executions, ['POST'])
  }

  delete(path: string, executions: TExecutionFns) {
    this.updatePathDirectory(path, executions, ['DELETE'])
  }

  all(path: string, executions: TExecutionFns) {
    this.updatePathDirectory(path, executions, [
      'GET',
      'DELETE',
      'PATCH',
      'POST',
      'PUT',
    ])
  }

  defaultHeaders(headerObj: IHeaderObj) {
    this.defaultUserHeaders = headerObj

    return
  }

  use(pathOrExecutions: string | TExecutionFns, executions?: TExecutionFns) {
    const selectedPath =
      typeof pathOrExecutions === 'string' ? pathOrExecutions : '(.*)'
    const selectedExecutions =
      typeof pathOrExecutions === 'string' ? executions : pathOrExecutions

    const useExists = this.useDirectory.get(selectedPath)

    if (useExists) {
      this.useDirectory.set(
        selectedPath,
        useExists.concat(setExecutions(selectedExecutions))
      )
    } else {
      this.useDirectory.set(selectedPath, setExecutions(selectedExecutions))
    }
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

    this.use(corsModule(optionsCallback))
  }

  private updatePathDirectory(
    path: string,
    executions: TExecutionFns,
    methods: TMethods[]
  ) {
    const pathExists = this.pathDirectory.get(path)
    const executionsToSet = setExecutions(executions)

    if (pathExists) {
      Object.keys(pathExists).forEach((method) => {
        if (pathExists[method]?.executions?.length) {
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

  notFound(executions: TExecutionFns) {
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

    res.setHeaders(this.defaultUserHeaders)

    const routeExecArr = route
      ? route.matchExecArr
      : exectionMap(this.notFoundExec)

    let nextClass = new ChopNext()

    try {
      routeExecArr.some((routeFn: TRouteCbFunction) => {
        if (nextClass.error) {
          throw nextClass.error
        }

        routeFn(req, res, nextClass.next) as TRouteCbFunction

        return res.getResponseClass()
      })
    } catch (e) {
      this.errorFn(e, req, res)
    }

    return res.getResponseClass()
  }

  listen(port: number, cb?: Function) {
    const _self = this

    logging.init()
    logging.info(`🥢 on port ${port}`)
    // logging.message(this.pathDirectory as any)
    // logging.message(this.useDirectory as any)

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
