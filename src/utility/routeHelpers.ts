export type TMethods = 'GET' | 'PATCH' | 'PUT' | 'POST' | 'DELETE'

export type TRouteCbFunction = (
  req: TChopReq,
  res: any,
  next?: TChopNext
) => any
export type TRouteErrorCbFunction = (
  error: Error,
  req: TChopReq,
  res: any
) => any
export type TExecutions = TRouteCbFunction | TRouteCbFunction[]

export const setExecutions = (executions: TExecutions) => {
  if (typeof executions === 'function') {
    return [executions]
  }

  return executions
}

export interface IChopListenOptions {
  port: string | number
}

export interface IPathObj {
  order: number
  executions: TRouteCbFunction[]
}

export interface IMethodDirectory {
  GET?: IPathObj
  PUT?: IPathObj
  PATCH?: IPathObj
  POST?: IPathObj
  DELETE?: IPathObj
}

export interface IUseDirectory {
  [key: string]: TRouteCbFunction[]
}

export interface IObj {
  [key: string]: any
}

export interface IQuery extends IObj {}
export interface IParams extends IObj {}

export type TChopReq = {
  bunReq: Request
  originalUrl: string
  query?: IQuery
  params?: IParams
}

export type TChopNext = Function

export type TChopRes = {
  // TODO make custom body types available
  _status?: number
  _body?: any
  json: Function
  text: Function
  status: Function
}

export interface IListenCallback {}
